import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  MessageSquare, 
  Mail, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Check, 
  RotateCcw,
  Trash2,
  Edit2
} from 'lucide-react';
import { TrackedTask, AcademicEventType } from '../types';

interface TaskCardProps {
  task: TrackedTask;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (task: TrackedTask) => void;
}

const getEventTypeBadge = (type: AcademicEventType) => {
  switch (type) {
    case 'assignment':
    case 'homework':
      return { label: 'Assignment', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'quiz':
      return { label: 'Quiz / Test', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    case 'experiment':
      return { label: 'Lab Experiment', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    case 'presentation':
      return { label: 'Presentation', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'experiential_learning':
      return { label: 'Experiential Learning', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'project':
      return { label: 'Project / Viva', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'mid_term':
      return { label: 'Mid-Term Exam', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    case 'end_term':
      return { label: 'End-Term Exam', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: 'Academic Work', bg: 'bg-white/10 text-slate-300 border-white/20' };
  }
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'whatsapp':
      return <MessageSquare className="w-3.5 h-3.5 text-green-400" />;
    case 'gmail':
      return <Mail className="w-3.5 h-3.5 text-rose-400" />;
    case 'classroom':
      return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
    case 'academic_calendar':
      return <Calendar className="w-3.5 h-3.5 text-teal-400" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case 'critical':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-semibold';
    case 'high':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'medium':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    default:
      return 'bg-white/5 text-slate-400 border-white/10';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onDelete,
  onReschedule,
}) => {
  const typeBadge = getEventTypeBadge(task.type);
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled' || task.cancelled;
  const isRescheduled = task.status === 'rescheduled' || task.dateChanged;

  // Calculate days remaining relative to simulated date 2026-09-05
  const simulatedToday = new Date('2026-09-05T00:00:00Z').getTime();
  const taskDueDate = new Date(`${task.dueDate}T00:00:00Z`).getTime();
  const diffDays = Math.ceil((taskDueDate - simulatedToday) / (1000 * 60 * 60 * 24));

  let timeRemainingText = '';
  if (diffDays < 0) {
    timeRemainingText = `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    timeRemainingText = 'Due Today';
  } else if (diffDays === 1) {
    timeRemainingText = 'Due Tomorrow';
  } else {
    timeRemainingText = `In ${diffDays} days`;
  }

  return (
    <div 
      id={`task-card-${task.id}`}
      className={`relative rounded-2xl border p-4 sm:p-5 transition-all bg-white/5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:bg-white/10 ${
        isCompleted 
          ? 'opacity-50 border-white/5' 
          : isCancelled 
          ? 'border-rose-500/30 bg-rose-500/5' 
          : isRescheduled 
          ? 'border-amber-500/30 bg-amber-500/5' 
          : 'border-white/10 hover:border-teal-500/30'
      }`}
    >
      {/* Date Changed Alert Banner */}
      {isRescheduled && !isCompleted && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Date Updated by AI:</strong> Was scheduled for{' '}
              <span className="line-through opacity-75">{task.originalDate || 'previous date'}</span>.
            </span>
          </div>
          <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
            Rescheduled
          </span>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center space-x-1.5 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Cancelled / Postponed:</strong> System verified cancellation from official notification.
          </span>
        </div>
      )}

      {/* Card Header: Type Badge, Course Code, Urgency */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeBadge.bg}`}>
            {typeBadge.label}
          </span>
          <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-wider">
            {task.subject}
          </span>
          {task.aiExtracted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20" title="Parsed automatically by Gemini AI">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Extracted
            </span>
          )}
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getUrgencyBadge(task.urgency)}`}>
          {task.urgency}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-sm sm:text-base font-semibold text-white mb-1.5 leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Schedule Details & Source Info */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {task.dueDate} {task.dueTime ? `(${task.dueTime})` : ''}
            </span>
          </div>

          <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-[11px] ${
            diffDays <= 2 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
              : diffDays <= 7 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-white/10 text-slate-300 border border-white/5'
          }`}>
            {timeRemainingText}
          </span>
        </div>

        {/* Source metadata */}
        <div className="flex items-center space-x-1 text-slate-500 text-[11px]" title={task.sourceDetails || task.source}>
          {getSourceIcon(task.source)}
          <span className="capitalize truncate max-w-[140px] sm:max-w-[200px]">
            {task.sourceDetails || task.source.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end space-x-1.5 mt-3 pt-2.5 border-t border-white/10">
        <button
          id={`btn-toggle-task-${task.id}`}
          onClick={() => onToggleStatus(task.id)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
            isCompleted
              ? 'bg-white/10 text-slate-300 hover:bg-white/20'
              : 'bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20'
          }`}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? <RotateCcw className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
          <span>{isCompleted ? 'Reopen' : 'Done'}</span>
        </button>

        <button
          id={`btn-reschedule-${task.id}`}
          onClick={() => onReschedule(task)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1"
          title="Reschedule Date"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit Date</span>
        </button>

        <button
          id={`btn-delete-${task.id}`}
          onClick={() => onDelete(task.id)}
          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Task"
          aria-label="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
