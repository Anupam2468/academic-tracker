import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Save } from 'lucide-react';
import { TrackedTask, AcademicEventType, UrgencyLevel, EventSource } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TrackedTask>) => void;
  editingTask?: TrackedTask | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems (CS301)');
  const [type, setType] = useState<AcademicEventType>('assignment');
  const [dueDate, setDueDate] = useState('2026-09-25');
  const [dueTime, setDueTime] = useState('23:59');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [source, setSource] = useState<EventSource>('manual');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setSubject(editingTask.subject);
      setType(editingTask.type);
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '23:59');
      setUrgency(editingTask.urgency);
      setSource(editingTask.source);
      setDescription(editingTask.description || '');
    } else {
      setTitle('');
      setSubject('Operating Systems (CS301)');
      setType('assignment');
      setDueDate('2026-09-25');
      setDueTime('23:59');
      setUrgency('medium');
      setSource('manual');
      setDescription('');
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onSave({
      title,
      subject,
      type,
      dueDate,
      dueTime,
      urgency,
      source,
      description,
      status: 'upcoming',
      requiresAlert: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-lg w-full p-6 border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white/90">
            {editingTask ? 'Edit / Reschedule Academic Work' : 'Add New Academic Work to Tracker'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-white/70 mb-1">
              Title / Topic *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Normalization Problem Set 3 or Quiz IV"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Subject / Course *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems (CS301)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Academic Event Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AcademicEventType)}
                className="w-full px-3 py-2 bg-[#0f172a]/90 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="assignment">Assignment / Homework</option>
                <option value="quiz">Quiz / Slot Test</option>
                <option value="experiment">Lab Experiment / Manual</option>
                <option value="presentation">Presentation / Seminar</option>
                <option value="experiential_learning">Experiential Learning</option>
                <option value="project">Project / Viva Evaluation</option>
                <option value="mid_term">Mid-Term Examination</option>
                <option value="end_term">End-Term Examination</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Due Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 bg-[#0f172a]/90 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical (Exam / Major Slot)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-white/70 mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as EventSource)}
                className="w-full px-3 py-2 bg-[#0f172a]/90 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="manual">Manual Entry</option>
                <option value="academic_calendar">Academic Calendar Ground Truth</option>
                <option value="classroom">Google Classroom</option>
                <option value="whatsapp">WhatsApp Message</option>
                <option value="gmail">College Gmail</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-white/70 mb-1">
              Description / Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add submission guidelines, portal links, lab instructions, or reasons for date change..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-white/70 hover:bg-white/10 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{editingTask ? 'Update Schedule' : 'Save to Tracker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
