import React, { useState, useEffect } from 'react';
import { getDocs, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, tasksCollection, notificationsCollection } from './lib/firebase';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Bell, 
  Key, 
  Plus, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { CalendarTimeline } from './components/CalendarTimeline';
import { IngestSimulator } from './components/IngestSimulator';
import { NotificationCenter } from './components/NotificationCenter';
import { IntegrationsManager } from './components/IntegrationsManager';
import { AddTaskModal } from './components/AddTaskModal';
import { AndroidFrame } from './components/AndroidFrame';

import { TrackedTask, AcademicNotification, AIParsingResult } from './types';
import { INITIAL_TRACKED_TASKS, INITIAL_NOTIFICATIONS } from './data/cguCalendar';

export function App() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'timeline' | 'ingest' | 'alerts' | 'integrations'>('tracker');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [tasks, setTasks] = useState<TrackedTask[]>(INITIAL_TRACKED_TASKS);
  const [notifications, setNotifications] = useState<AcademicNotification[]>(INITIAL_NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TrackedTask | null>(null);

  // Load from backend on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const tasksSnap = await getDocs(tasksCollection);
      const notifsSnap = await getDocs(notificationsCollection);
      
      let fetchedTasks = tasksSnap.docs.map(d => d.data() as any).sort((a,b) => b.lastUpdated.localeCompare(a.lastUpdated));
      let fetchedNotifs = notifsSnap.docs.map(d => d.data() as any).sort((a,b) => b.timestamp.localeCompare(a.timestamp));

      // Seed database with initial data if it's completely empty
      if (fetchedTasks.length === 0 && fetchedNotifs.length === 0) {
        const batch = writeBatch(db);
        INITIAL_TRACKED_TASKS.forEach(t => {
           batch.set(doc(tasksCollection, t.id), t);
        });
        INITIAL_NOTIFICATIONS.forEach(n => {
           batch.set(doc(notificationsCollection, n.id), n);
        });
        await batch.commit();
        fetchedTasks = INITIAL_TRACKED_TASKS.sort((a,b) => b.lastUpdated.localeCompare(a.lastUpdated));
        fetchedNotifs = INITIAL_NOTIFICATIONS.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
      }

      setTasks(fetchedTasks);
      setNotifications(fetchedNotifs);
    } catch (e) {
      console.error('Error fetching from Firebase:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  
  const handleToggleTaskStatus = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      await updateDoc(doc(db, 'tasks', id), { status: newStatus, lastUpdated: new Date().toISOString() });
    } catch (e) {
      console.error(e);
      fetchData(); // revert on error
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete task on server:', e);
    }
  };

  const handleOpenEdit = (task: TrackedTask) => {
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<TrackedTask>) => {
    if (editingTask) {
      // Check if date changed
      const dateChanged = editingTask.dueDate !== taskData.dueDate;
      const updatedTask: TrackedTask = {
        ...editingTask,
        ...taskData,
        dateChanged: dateChanged || editingTask.dateChanged,
        originalDate: dateChanged ? editingTask.dueDate : editingTask.originalDate,
        status: dateChanged ? 'rescheduled' : editingTask.status,
      } as TrackedTask;

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));

      if (dateChanged) {
        const newAlert: AcademicNotification = {
          id: `alert-${Date.now()}`,
          title: `Schedule Changed: ${updatedTask.title}`,
          message: `Date updated from ${editingTask.dueDate} to ${taskData.dueDate}.`,
          type: 'date_changed',
          severity: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTaskId: updatedTask.id,
          source: 'manual',
        };
        setNotifications((prev) => [newAlert, ...prev]);
      }

      try {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
      } catch (e) {
        console.error('Failed to update task:', e);
      }
    } else {
      // New task
      const newTask: TrackedTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Untitled Work',
        subject: taskData.subject || 'General Academic',
        type: taskData.type || 'assignment',
        dueDate: taskData.dueDate || '2026-09-25',
        dueTime: taskData.dueTime || '23:59',
        urgency: taskData.urgency || 'medium',
        source: taskData.source || 'manual',
        description: taskData.description || '',
        status: 'upcoming',
        requiresAlert: true,
        aiExtracted: false,
        lastUpdated: new Date().toISOString(),
      };

      setTasks((prev) => [newTask, ...prev]);

      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });
      } catch (e) {
        console.error('Failed to create task on server:', e);
      }
    }
  };

  const handleProcessComplete = async (result: any) => {
    if (result.parsed && result.parsed.action !== 'Ignore' && result.autoApplied) {
       try {
         const newDocRef = doc(tasksCollection);
         const newTask = {
            id: newDocRef.id,
            title: result.parsed.title || "Untitled Task",
            subject: result.parsed.subject || "General",
            type: result.parsed.event_type || "assignment",
            dueDate: result.parsed.new_date || new Date().toISOString(),
            status: "pending",
            source: "AI Extracted",
            lastUpdated: new Date().toISOString()
         };
         await setDoc(newDocRef, newTask);
       } catch (e) {
         console.error(e);
       }
    }
    fetchData();
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleJumpToTask = (taskId: string) => {
    setActiveTab('tracker');
    setTimeout(() => {
      const el = document.getElementById(`task-card-${taskId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-500/50');
        setTimeout(() => el.classList.remove('ring-4', 'ring-blue-500/50'), 2500);
      }
    }, 200);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <TaskList
            tasks={tasks}
            onToggleStatus={handleToggleTaskStatus}
            onDelete={handleDeleteTask}
            onReschedule={handleOpenEdit}
            onOpenAddTask={() => {
              setEditingTask(null);
              setIsAddModalOpen(true);
            }}
            onOpenSimulator={() => setActiveTab('ingest')}
          />
        );
      case 'timeline':
        return <CalendarTimeline />;
      case 'ingest':
        return <IngestSimulator onProcessComplete={handleProcessComplete} />;
      case 'alerts':
        return (
          <NotificationCenter
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onDeleteNotif={handleDeleteNotification}
            onJumpToTask={handleJumpToTask}
          />
        );
      case 'integrations':
        return <IntegrationsManager />;
      default:
        return null;
    }
  };

  const navTabs = [
    { id: 'tracker', label: 'Work Tracker', icon: CheckSquare, badge: null },
    { id: 'timeline', label: 'Master Timeline', icon: CalendarIcon, badge: 'CGU Ground Truth' },
    { id: 'ingest', label: 'AI Ingestion Hub', icon: Sparkles, badge: 'Gemini AI' },
    { id: 'alerts', label: 'Alerts & Alarms', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'integrations', label: 'APIs & Setup', icon: Key, badge: null },
  ];

  const content = (
    <div className="flex-1 flex flex-col">
      {/* App Tab Bar */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      typeof tab.badge === 'number'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isActive
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  );

  return (
    <div className="min-h-screen text-white flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentSimulatedDate="2026-09-05"
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        unreadNotifsCount={unreadCount}
        onOpenNotifications={() => setActiveTab('alerts')}
        onRefreshData={fetchData}
        isRefreshing={isRefreshing}
      />

      {isMobileFrame ? (
        <AndroidFrame activeTab={activeTab} setActiveTab={(t) => setActiveTab(t as any)} unreadCount={unreadCount}>
          {content}
        </AndroidFrame>
      ) : (
        content
      )}
    </div>
  );
}
export default App;
