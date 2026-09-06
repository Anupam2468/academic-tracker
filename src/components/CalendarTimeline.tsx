import React from 'react';
import { 
  Calendar, 
  Flag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CGU_ACADEMIC_CALENDAR } from '../data/cguCalendar';
import { AcademicMasterEvent } from '../types';

export const CalendarTimeline: React.FC = () => {
  const simulatedToday = '2026-09-05';

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'milestone':
        return { label: 'University Milestone', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'assignment':
        return { label: 'Assessment Slot', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'quiz':
        return { label: 'Quiz Window', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'project':
        return { label: 'Evaluation & Viva', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'holiday':
        return { label: 'Holiday Break', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'end_term':
        return { label: 'End Semester Exams', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      default:
        return { label: 'Academic Event', color: 'bg-white/10 text-slate-300 border-white/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* University Ground Truth Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-lg shadow-[0_0_30px_rgba(45,212,191,0.05)] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-bold tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Ground Truth Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-medium tracking-tight">
              {CGU_ACADEMIC_CALENDAR.university}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Official Master Schedule • {CGU_ACADEMIC_CALENDAR.semester} ({CGU_ACADEMIC_CALENDAR.academicYear})
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs shrink-0 max-w-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2 uppercase tracking-widest text-[10px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Simulated Timeline</span>
            </div>
            <p className="font-mono text-white text-base font-medium">{simulatedToday}</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Mid-Semester Results day. Next major slot is Assignment/Quiz III (Sept 21).
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-teal-500/20 flex items-start space-x-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-teal-300">How the tracker works:</strong> This master schedule is embedded in Gemini AI's reasoning memory. Whenever an email from a professor or WhatsApp text arrives mentioning rescheduled exams or changed deadlines, the system compares the claim against these ground truth dates to identify conflicts and alert you immediately.
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 my-6 ml-2">
        {CGU_ACADEMIC_CALENDAR.events.map((event, idx) => {
          const isToday = event.startDate === simulatedToday;
          const isPast = event.startDate < simulatedToday;
          const badge = getEventBadge(event.type);

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div 
                className={`absolute -left-[30px] sm:-left-[38px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isToday
                    ? 'bg-teal-500 border-teal-300 shadow-[0_0_15px_#2dd4bf] scale-125'
                    : isPast
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-[#020617] border-slate-500'
                }`}
              >
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
              </div>

              {/* Event Card */}
              <div 
                id={`timeline-event-${event.id}`}
                className={`p-5 rounded-2xl border transition-all ${
                  isToday 
                    ? 'bg-teal-500/10 border-teal-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(45,212,191,0.1)]' 
                    : 'bg-white/5 border-white/10 backdrop-blur-md hover:border-white/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                      {badge.label}
                    </span>
                    {isToday && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-teal-500 text-slate-900 uppercase tracking-wider shadow-[0_0_10px_#2dd4bf] animate-pulse">
                        Today's Milestone
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono text-xs font-medium text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.startDate}</span>
                    {event.endDate && event.endDate !== event.startDate && (
                      <>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span>{event.endDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white mb-2">
                  {event.eventName}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {event.description}
                </p>

                {/* Specific notes for CGU peculiarities */}
                {event.id === 'cgu-ev-3' && (
                  <div className="mt-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium leading-relaxed">
                    📍 <strong>Note on Classroom Closure:</strong> Formal lectures end Oct 5. After this, student activities transition purely to evaluation, project reviews, and end-semester examinations.
                  </div>
                )}
                {event.id === 'cgu-ev-7' && (
                  <div className="mt-3 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium leading-relaxed">
                    🚨 <strong>High-Stakes Period:</strong> End semester exams (Oct 26 - Nov 03). Any emails proposing date shifts will trigger emergency alarms.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
