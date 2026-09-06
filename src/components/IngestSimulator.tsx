import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { tasksCollection } from '../lib/firebase';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  Code,
  Smartphone
} from 'lucide-react';
import { EventSource, AIParsingResult, TrackedTask, AcademicNotification } from '../types';

interface IngestSimulatorProps {
  onProcessComplete: (result: {
    parsed: AIParsingResult;
    task?: TrackedTask | null;
    notification?: AcademicNotification | null;
  }) => void;
}

const PRESET_SCENARIOS = [
  {
    id: 'scenario-reschedule-quiz',
    title: '🚨 Date Postponed: DBMS Quiz III',
    source: 'whatsapp' as EventSource,
    sender: 'Class Representative (Rohit)',
    groupName: 'CS Batch 2026 Official',
    text: 'Guys, Dr. Patnaik just confirmed in the faculty meeting that the DBMS Quiz III is postponed from Sept 24 to September 29th due to the campus hackathon. Update your schedules!',
    typeLabel: 'WhatsApp Reschedule',
  },
  {
    id: 'scenario-exam-conflict',
    title: '⚠️ Date Shift: End Semester Examination',
    source: 'gmail' as EventSource,
    sender: 'Dean of Academic Affairs (dean.academics@cgu-odisha.ac.in)',
    groupName: '',
    text: 'Dear Students, In view of the State Technical Olympiad, the commencement of the End Semester Examination is rescheduled. Exams will now begin on November 2nd, 2026 instead of the scheduled October 26th. The revised slot timetable will be published shortly.',
    typeLabel: 'Gmail Exam Conflict',
  },
  {
    id: 'scenario-cancel-experiment',
    title: '🛑 Lab Cancelled: Networks Experiment #7',
    source: 'classroom' as EventSource,
    sender: 'Prof. Ananya Sen • Classroom CS312',
    groupName: '',
    text: 'Class, please note that tomorrow\'s Computer Networks Lab Experiment session on Packet Filtering is cancelled due to server maintenance in the lab. We will combine it with next week\'s slot.',
    typeLabel: 'Classroom Cancellation',
  },
  {
    id: 'scenario-new-assignment',
    title: '✨ New Experiential Learning Task',
    source: 'gmail' as EventSource,
    sender: 'EL Faculty Coordinator (el.projects@cgu-odisha.ac.in)',
    groupName: '',
    text: 'Dear 3rd Year Students, The Experiential Learning Milestone-II report for your Smart Campus IoT Prototype must be submitted by October 03, 2026 at 5:00 PM on the university portal. Evaluation carries 15 marks.',
    typeLabel: 'Gmail New Task',
  },
];

export const IngestSimulator: React.FC<IngestSimulatorProps> = ({ onProcessComplete }) => {
  const [source, setSource] = useState<EventSource>('whatsapp');
  const [sender, setSender] = useState('Rohit (Class Rep)');
  const [groupName, setGroupName] = useState('CS Batch 2026 Official');
  const [messageText, setMessageText] = useState(
    'Guys, Dr. Patnaik just confirmed in the faculty meeting that the DBMS Quiz III is postponed from Sept 24 to September 29th due to the campus hackathon. Update your schedules!'
  );
  const [autoApply, setAutoApply] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AIParsingResult | null>(null);
  const [rawJsonResponse, setRawJsonResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSource(preset.source);
    setSender(preset.sender);
    setGroupName(preset.groupName);
    setMessageText(preset.text);
    setErrorMsg(null);
  };

  const handleProcessMessage = async () => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const fullSource = source === 'whatsapp' && groupName 
      ? `WhatsApp: ${groupName}` 
      : source === 'gmail' 
      ? `Gmail (${sender})` 
      : source === 'classroom' 
      ? `Classroom (${sender})` 
      : source;

    try {
      const response = await fetch('/api/incoming/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: fullSource,
          sender,
          messageText,
          autoApply,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setLastResult(data.parsed);
      setRawJsonResponse(JSON.stringify(data.parsed, null, 2));
      
      // Override autoApplied based on the client checkbox
      data.autoApplied = autoApply;
      onProcessComplete(data);
    } catch (err: any) {
      console.error('Error processing message:', err);
      setErrorMsg(err?.message || 'Failed to process message with AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                AI Ingestion & Automation Studio
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Test how Gemini parses incoming messages from WhatsApp, Gmail, or Classroom and updates your tracker.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulating Android Listener</span>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Try One-Click Realistic University Scenarios:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                id={`btn-preset-${preset.id}`}
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-500/40 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-teal-300 line-clamp-1 mb-1">
                  {preset.title}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-teal-500/70">
                  {preset.typeLabel}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Playground Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <span>Incoming Announcement Simulator</span>
          </h3>

          {/* Source Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400' },
              { id: 'gmail', label: 'College Gmail', icon: Mail, color: 'text-rose-400' },
              { id: 'classroom', label: 'Classroom', icon: BookOpen, color: 'text-blue-400' },
            ].map((src) => {
              const Icon = src.icon;
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSource(src.id as EventSource)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    source === src.id
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${source === src.id ? 'text-teal-400' : src.color}`} />
                  <span>{src.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sender & Group fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Sender Name / Email
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Prof. Patnaik or Class Rep"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-hidden text-sm"
              />
            </div>

            {source === 'whatsapp' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  WhatsApp Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. CS Batch 2026 Official"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-hidden text-sm"
                />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Raw Message / Email Body
            </label>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste announcement text containing dates, assignments, quiz updates, cancellations, or exam changes..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-hidden text-sm leading-relaxed"
            />
          </div>

          {/* Options & Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-teal-500 focus:ring-teal-500/50 w-4 h-4"
              />
              <span className="font-medium">
                Auto-update tracker & generate alarm notifications
              </span>
            </label>

            <button
              id="btn-process-with-gemini"
              onClick={handleProcessMessage}
              disabled={isLoading || !messageText.trim()}
              className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(45,212,191,0.3)] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI is Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process with Gemini AI</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* AI Output & Breakdown */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Code className="w-4 h-4 text-teal-400" />
                <span>Gemini Extraction Output</span>
              </h3>
              {lastResult && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">
                  Confidence: {Math.round((lastResult.confidence || 0.95) * 100)}%
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-4">
                {/* Visual result card */}
                <div className={`p-4 rounded-2xl border ${
                  lastResult.action === 'Update'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                    : lastResult.action === 'Cancel'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {lastResult.action} Detected
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                      {lastResult.event_type.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold mb-2 text-white">
                    {lastResult.subject}: {lastResult.title}
                  </h4>

                  <p className="text-sm leading-relaxed opacity-80 mb-3">
                    {lastResult.summary}
                  </p>

                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Target Date:</span>
                      <span className="font-mono text-white">
                        {lastResult.new_date || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Alarm Trigger:</span>
                      <span className={`font-semibold ${lastResult.requires_alert ? 'text-rose-400' : 'text-slate-300'}`}>
                        {lastResult.requires_alert ? '🚨 High Priority' : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {lastResult.conflictsWithMasterCalendar && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Conflicts with official CGU Master Schedule!</span>
                    </div>
                  )}
                </div>

                {/* Reasoning note */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">AI Reasoning: </span>
                  {lastResult.reasoning}
                </div>

                {/* Collapsible raw JSON */}
                <details className="text-sm text-slate-400">
                  <summary className="cursor-pointer font-medium hover:text-white py-1 transition-colors">
                    View Structured JSON Response
                  </summary>
                  <pre className="mt-2 p-4 rounded-xl bg-[#020617] border border-white/10 text-slate-300 text-xs font-mono overflow-x-auto max-h-48 scrollbar-thin">
                    {rawJsonResponse}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-50" />
                <p className="text-sm leading-relaxed px-4">
                  Run a preset or type an announcement on the left to see Gemini AI parse the academic data in real-time.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
            Powered by <strong className="text-teal-400/80">Gemini 3.8 Flash</strong> with server-side structured output schema.
          </div>
        </div>
      </div>
    </div>
  );
};
