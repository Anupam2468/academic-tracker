import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TrackedTask, AcademicEventType } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: TrackedTask[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (task: TrackedTask) => void;
  onOpenAddTask: () => void;
  onOpenSimulator: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onDelete,
  onReschedule,
  onOpenAddTask,
  onOpenSimulator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'subject'>('date');

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const rescheduled = tasks.filter(t => t.status === 'rescheduled' || t.dateChanged).length;
    
    // items within 7 days from 2026-09-05
    const simToday = new Date('2026-09-05T00:00:00Z').getTime();
    const urgentSoon = tasks.filter(t => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      const due = new Date(`${t.dueDate}T00:00:00Z`).getTime();
      const diffDays = (due - simToday) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return { total, completed, rescheduled, urgentSoon };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter category
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'rescheduled') return task.status === 'rescheduled' || task.dateChanged;
      if (selectedFilter === 'due_soon') {
        const simToday = new Date('2026-09-05T00:00:00Z').getTime();
        const due = new Date(`${task.dueDate}T00:00:00Z`).getTime();
        const diffDays = (due - simToday) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7 && task.status !== 'completed';
      }
      if (selectedFilter === 'assignment') return task.type === 'assignment' || task.type === 'homework';
      if (selectedFilter === 'quiz') return task.type === 'quiz';
      if (selectedFilter === 'experiment') return task.type === 'experiment';
      if (selectedFilter === 'presentation') return task.type === 'presentation' || task.type === 'project';
      if (selectedFilter === 'experiential_learning') return task.type === 'experiential_learning';
      if (selectedFilter === 'exam') return task.type === 'mid_term' || task.type === 'end_term';
      if (selectedFilter === 'completed') return task.status === 'completed';

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'urgency') {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return (order[b.urgency] || 0) - (order[a.urgency] || 0);
      }
      return a.subject.localeCompare(b.subject);
    });
  }, [tasks, searchQuery, selectedFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Rescheduled or Urgent Events Exist */}
      {stats.rescheduled > 0 && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {stats.rescheduled} Deadline{stats.rescheduled > 1 ? 's' : ''} Automatically Updated by AI
              </h4>
              <p className="text-xs text-amber-500">
                New dates were detected from incoming notifications and verified against the CGU calendar.
              </p>
            </div>
          </div>
          <button
            id="btn-filter-rescheduled"
            onClick={() => setSelectedFilter('rescheduled')}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors shrink-0"
          >
            Review Changes
          </button>
        </div>
      )}

      {/* Quick Academic Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-lg">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Tracked</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</p>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded uppercase">All</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-lg">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Due in 7 Days</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.urgentSoon}</p>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">Urgent</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-lg">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date Changes</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-400">{stats.rescheduled}</p>
            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">AI Fixed</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-lg">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Completed</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.completed}</p>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Done</span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-tasks"
            type="text"
            placeholder="Search assignments, quizzes, labs, subjects (e.g. CS301, DBMS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort selection */}
          <select
            id="select-sort-tasks"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-2xl text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 [&>option]:bg-slate-900"
          >
            <option value="date">Sort: Due Date</option>
            <option value="urgency">Sort: Urgency</option>
            <option value="subject">Sort: Subject</option>
          </select>

          {/* Test Incoming Feed Button */}
          <button
            id="btn-open-simulator-tab"
            onClick={onOpenSimulator}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 flex items-center space-x-1.5 transition-colors whitespace-nowrap backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            title="Simulate incoming WhatsApp message or College Email"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Feed</span>
          </button>

          {/* Add Manual Task */}
          <button
            id="btn-add-task-manual"
            onClick={onOpenAddTask}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(45,212,191,0.3)] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work</span>
          </button>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'due_soon', label: '⏳ Due Soon' },
          { id: 'rescheduled', label: '🚨 Date Changed' },
          { id: 'assignment', label: 'Assignments' },
          { id: 'quiz', label: 'Quizzes' },
          { id: 'experiment', label: 'Experiments / Labs' },
          { id: 'presentation', label: 'Presentations & Project' },
          { id: 'experiential_learning', label: 'Experiential Learning' },
          { id: 'exam', label: 'Mid/End-Terms' },
          { id: 'completed', label: 'Completed' },
        ].map((chip) => (
          <button
            key={chip.id}
            id={`filter-chip-${chip.id}`}
            onClick={() => setSelectedFilter(chip.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap text-[11px] uppercase tracking-wider ${
              selectedFilter === chip.id
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(45,212,191,0.2)]'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-lg">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-base font-medium text-slate-200">No matching academic work found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 mb-6">
            Try adjusting your search or category filter, or click simulate to parse incoming notifications from WhatsApp or college Gmail!
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium hover:bg-teal-500/30 transition-colors"
            >
              Simulate Notifications
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onReschedule={onReschedule}
            />
          ))}
        </div>
      )}
    </div>
  );
};
