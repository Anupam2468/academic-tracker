export type AcademicEventType =
  | 'assignment'
  | 'homework'
  | 'quiz'
  | 'presentation'
  | 'experiential_learning'
  | 'experiment'
  | 'mid_term'
  | 'end_term'
  | 'project'
  | 'milestone'
  | 'holiday';

export type TaskStatus =
  | 'upcoming'
  | 'due_soon'
  | 'completed'
  | 'rescheduled'
  | 'cancelled';

export type EventSource =
  | 'academic_calendar'
  | 'whatsapp'
  | 'gmail'
  | 'classroom'
  | 'google_calendar'
  | 'manual';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AcademicMasterEvent {
  id: string;
  eventName: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  type: AcademicEventType;
  description: string;
  isMilestone?: boolean;
}

export interface TrackedTask {
  id: string;
  title: string;
  subject: string;
  type: AcademicEventType;
  dueDate: string;         // YYYY-MM-DD or ISO
  endDate?: string;        // YYYY-MM-DD (for range)
  dueTime?: string;        // e.g. "17:00" or "23:59"
  status: TaskStatus;
  urgency: UrgencyLevel;
  source: EventSource;
  sourceDetails?: string;  // e.g. "Prof. Patnaik (Email)" or "WhatsApp: CS Batch 2026"
  description?: string;
  originalDate?: string;   // if rescheduled
  dateChanged?: boolean;
  cancelled?: boolean;
  requiresAlert: boolean;
  alertTriggered?: boolean;
  lastUpdated: string;
  aiExtracted?: boolean;
  aiConfidence?: number;
  tags?: string[];
}

export interface AcademicNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'date_changed' | 'cancelled' | 'due_soon' | 'new_detected' | 'system' | 'reminder';
  severity: 'info' | 'warning' | 'danger' | 'success';
  relatedTaskId?: string;
  subject?: string;
  read: boolean;
  requiresUserReview?: boolean;
  source: EventSource;
  previousDate?: string;
  newDate?: string;
}

export interface IngestMessageRequest {
  source: EventSource;
  sender: string;
  messageText: string;
  timestamp?: string;
  groupName?: string;
}

export interface AIParsingResult {
  subject: string;
  title: string;
  event_type: AcademicEventType;
  action: 'New' | 'Update' | 'Cancel' | 'Reminder' | 'Ignore';
  original_calendar_date?: string;
  new_date?: string;
  due_time?: string;
  urgency: UrgencyLevel;
  summary: string;
  requires_alert: boolean;
  confidence: number;
  reasoning: string;
  conflictsWithMasterCalendar?: boolean;
}

export interface IntegrationConfig {
  gemini: {
    configured: boolean;
    model: string;
    status: 'online' | 'unconfigured' | 'error';
    apiKeyMasked?: string;
  };
  whatsapp: {
    configured: boolean;
    monitoredGroups: string[];
    keywords: string[];
    listenerServiceActive: boolean;
    webhookUrl: string;
  };
  gmail: {
    configured: boolean;
    connectedEmail?: string;
    pollingIntervalMinutes: number;
    filterKeywords: string[];
  };
  classroom: {
    configured: boolean;
    enrolledCourses: string[];
    autoSyncDueDates: boolean;
  };
  calendar: {
    configured: boolean;
    syncReminders: boolean;
    defaultAlertHours: number[];
  };
}
