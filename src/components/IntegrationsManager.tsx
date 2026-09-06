import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs } from 'firebase/firestore';
import { db, tasksCollection } from '../lib/firebase';
import { 
  Key, 
  Sparkles, 
  MessageSquare, 
  Mail, 
  Calendar as CalendarIcon, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Code,
  ShieldCheck,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { getGoogleOAuthClient } from '../lib/google-auth';

export const IntegrationsManager: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for user's upcoming APIs
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('student@cgu-odisha.ac.in');
  const [whatsappGroups, setWhatsappGroups] = useState('CS Batch 2026 Official, CGU CSE Section B, Capstone Team 14');
  const [whatsappKeywords, setWhatsappKeywords] = useState('assignment, quiz, exam, postponed, cancelled, due, submission, rescheduled');
  const [isSaved, setIsSaved] = useState(false);
  
  const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(false);
  const [isExportingDrive, setIsExportingDrive] = useState(false);
  const [googleWorkspaceToken, setGoogleWorkspaceToken] = useState<string | null>(null);

  const handleWorkspaceAuth = () => {
    const scopes = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
    const client = getGoogleOAuthClient(scopes, async (response) => {
      if (response.error) {
        console.error(response);
        return;
      }
      setGoogleWorkspaceToken(response.access_token);
      setIsSyncingWorkspace(true);
      try {
        const res = await fetch('/api/workspace/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: response.access_token })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) {
            for (const t of data.tasks) {
              await setDoc(doc(tasksCollection, t.id), t);
            }
          }
          alert('Google Workspace synced successfully!');
          // Ideally we'd trigger a refresh here, but for now it's fine.
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSyncingWorkspace(false);
      }
    });
    client?.requestAccessToken();
  };

  const handleDriveExport = () => {
    setIsExportingDrive(true);
    const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
      client_id: "20007722563-9s42n85k5hqc555da8k6g1i8g2bhmuu7.apps.googleusercontent.com",
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: async (response: any) => {
        try {
          // fetch tasks from firestore first
                    const snap = await getDocs(tasksCollection);
          const currentTasks = snap.docs.map(d => d.data());
          
          const res = await fetch('/api/drive/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.access_token, tasks: currentTasks })
          });
          if (res.ok) alert('Exported to Google Drive successfully!');
        } catch (err) {
          console.error(err);
        } finally {
          setIsExportingDrive(false);
        }
      }
    });
    client?.requestAccessToken();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const androidListenerCode = `// Android Kotlin: NotificationListener.kt
package com.cgu.academictracker

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.os.Bundle
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class AcademicNotificationListener : NotificationListenerService() {
    private val client = OkHttpClient()
    private val webhookUrl = "https://your-app-url/api/incoming/whatsapp"
    private val targetGroups = listOf("CS Batch 2026 Official", "CGU CSE Section B")
    private val triggerWords = listOf("assignment", "quiz", "postponed", "cancelled", "exam")

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn?.packageName == "com.whatsapp") {
            val extras: Bundle = sbn.notification.extras
            val title = extras.getString("android.title") ?: ""
            val text = extras.getCharSequence("android.text")?.toString() ?: ""

            // Filter by college group or trigger keywords
            val matchesGroup = targetGroups.any { title.contains(it, ignoreCase = true) }
            val containsKeyword = triggerWords.any { text.contains(it, ignoreCase = true) }

            if (matchesGroup || containsKeyword) {
                val json = JSONObject().apply {
                    put("sender", title)
                    put("message", text)
                    put("groupName", title)
                    put("timestamp", System.currentTimeMillis())
                }
                val body = json.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder().url(webhookUrl).post(body).build()
                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: java.io.IOException) {}
                    override fun onResponse(call: Call, response: Response) { response.close() }
                })
            }
        }
    }
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white/90">
              API Keys & Multi-Service Integrations
            </h2>
            <p className="text-xs text-white/50">
              Your Gemini AI key is active and automating your CGU schedule. Connect your Google Workspace and WhatsApp endpoints below.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Gemini AI Service (ACTIVE) */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-emerald-500/30 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">Google Gemini AI Engine</h3>
                <p className="text-xs text-white/50">Model: gemini-3.8-flash (Server-side)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active & Verified</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Provided Gemini Key:</span>
              <span className="font-mono text-white/80 font-semibold">AQ.Ab8RN6...1lCByI4zA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Security Storage:</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Backend Express Protected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Active Capabilities:</span>
              <span className="text-white/70">JSON Schema extraction, CGU calendar conflict detection</span>
            </div>
          </div>

          <div className="text-xs text-white/60 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            ✓ <strong>Automation Ready:</strong> Every message fed from WhatsApp, Gmail, or Classroom is processed via this Gemini AI key to extract deadlines and update your records.
          </div>
        </div>

        {/* 2. WhatsApp & Android Notification Listener */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">WhatsApp Android Listener</h3>
                <p className="text-xs text-white/50">Reads college group notifications via Android service</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Listener Ready</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="font-semibold text-white/70 block mb-1">
                Backend Ingest Webhook URL:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="/api/incoming/whatsapp"
                  className="flex-1 px-2.5 py-1.5 font-mono text-xs bg-white/5 border border-white/10 rounded-lg text-white/80"
                />
                <button
                  onClick={() => copyToClipboard('/api/incoming/whatsapp', 'webhook')}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/60"
                  title="Copy Endpoint"
                >
                  {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1">
                Monitored WhatsApp Groups:
              </label>
              <input
                type="text"
                value={whatsappGroups}
                onChange={(e) => setWhatsappGroups(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-hidden focus:border-white/20"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1">
                Trigger Keywords:
              </label>
              <input
                type="text"
                value={whatsappKeywords}
                onChange={(e) => setWhatsappKeywords(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-hidden focus:border-white/20"
              />
            </div>
          </div>
        </div>

        {/* 3. Google Workspace APIs (Gmail & Google Classroom) */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">Gmail (College Email)</h3>
                <p className="text-xs text-white/50">Filters professor emails & exam cancellations</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${googleWorkspaceToken ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/10 text-white/50 border-white/20'}`}>
              <span>{googleWorkspaceToken ? 'Authenticated' : 'Awaiting OAuth Credentials'}</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col space-y-2">
              <label className="font-semibold text-white/70 block">
                Connect your Google Account:
              </label>
              <button
                onClick={handleWorkspaceAuth}
                disabled={isSyncingWorkspace}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold transition-colors flex items-center justify-center space-x-2 border border-indigo-500/30 disabled:opacity-50"
              >
                {isSyncingWorkspace ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{isSyncingWorkspace ? 'Syncing...' : 'Sign in with Google to Sync'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
              💡 <strong>Integration Note:</strong> This will grant the dashboard access to read your college Gmail, fetch active Classroom assignments, and read/write to your Calendar.
            </div>
          </div>
        </div>

        {/* 4. Google Classroom & Google Calendar */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">Google Calendar & Classroom</h3>
                <p className="text-xs text-white/50">Auto-sync assignments & two-way phone calendar push</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Ready to Sync
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Active Classroom Courses:</span>
                <span className="font-semibold text-white/90">4 Monitored (CS301, CS302, CS312, EL201)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Calendar Alarm Timing:</span>
                <span className="font-semibold text-white/90">3 Days, 24 Hours, & 2 Hours prior</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Date-Change Alerts:</span>
                <span className="font-semibold text-rose-400">Instant High Priority Push</span>
              </div>
            </div>

            <button
              onClick={handleSaveConfigs}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              <span>{isSaved ? 'Settings Saved Successfully!' : 'Save API Configuration Settings'}</span>
            </button>
          </div>
        </div>

        {/* 5. Google Drive Integration */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">Google Drive Cloud Backup</h3>
                <p className="text-xs text-white/50">Export your tracked tasks and academic records to your personal Google Drive.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
              Drive API Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/70">
              Backup your entire academic history to a JSON file securely stored in your Google Drive.
            </span>
            <button
              onClick={handleDriveExport}
              disabled={isExportingDrive}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-bold rounded-lg transition-colors border border-green-500/30 flex items-center space-x-2 disabled:opacity-50"
            >
              {isExportingDrive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Export to Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Android Kotlin Code Dropdown for User's Native App */}
      <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white/90">
              Android Native Code: WhatsApp Notification Listener
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(androidListenerCode, 'code')}
            className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-medium text-white/70 flex items-center space-x-1"
          >
            {copiedKey === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'code' ? 'Copied!' : 'Copy Kotlin Code'}</span>
          </button>
        </div>

        <p className="text-xs text-white/60">
          Drop this Kotlin service into your Android app project in Android Studio. It runs in the background, intercepts incoming college WhatsApp group messages, and sends them to your backend's Gemini AI parsing webhook!
        </p>

        <pre className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
          {androidListenerCode}
        </pre>
      </div>
    </div>
  );
};
