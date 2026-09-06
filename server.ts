
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from 'googleapis';
import { CGU_ACADEMIC_CALENDAR } from "./src/data/cguCalendar.ts";
import type { TrackedTask, AcademicNotification, AIParsingResult } from "./src/types.ts";

const app = express();
const PORT = 3000;
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CGU Academic Tracker API", time: new Date().toISOString() });
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6LDIQT16RGIwaxKuq8urw_SMTiTsbWJTu02h1lCByI4zA";
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
};

const PARSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: "The academic subject or course code (e.g. 'Operating Systems', 'CS301')" },
    title: { type: Type.STRING, description: "A concise title for the task or event" },
    event_type: { type: Type.STRING, description: "The type of event", enum: ["assignment", "quiz", "mid_term", "end_term", "project", "presentation", "experiment", "experiential_learning", "other"] },
    action: { type: Type.STRING, description: "What needs to be done based on the message", enum: ["New", "Update", "Cancel", "Reminder", "Ignore"] },
    new_date: { type: Type.STRING, description: "The deadline or event date extracted, in ISO format if possible, or readable string" },
    urgency: { type: Type.STRING, description: "Urgency level", enum: ["low", "medium", "high", "critical"] },
    summary: { type: Type.STRING, description: "A short human-readable summary of the announcement" },
    requires_alert: { type: Type.BOOLEAN, description: "True if this is a major schedule change or upcoming critical deadline requiring a push notification alarm" },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
    reasoning: { type: Type.STRING, description: "Brief explanation of how the AI parsed this message and matched it to the CGU syllabus" },
    conflictsWithMasterCalendar: { type: Type.BOOLEAN, description: "True if the announced date contradicts the official CGU Academic Calendar" }
  },
  required: ["subject", "title", "event_type", "action", "urgency", "summary", "requires_alert", "confidence", "reasoning"]
};

app.post("/api/incoming/process", async (req, res) => {
  try {
    const { source, sender, messageText, autoApply } = req.body;
    if (!messageText) return res.status(400).json({ error: "messageText is required" });
    const ai = getGeminiClient();
    if (!ai) return res.status(500).json({ error: "Gemini not configured" });

    const prompt = `You are an automated academic work parser for a CGU student. Current date: 2026-09-05.
Calendar ground truth: ${JSON.stringify(CGU_ACADEMIC_CALENDAR.events)}

CRITICAL FILTERING RULES:
You must ONLY extract tasks that are relevant to:
- B.Tech CSE (Computer Science Engineering) department.
- 2nd Year students.
- 3rd Semester specific.
AND you MUST IGNORE (action = "Ignore") any information that is specific to a particular Group or Section (e.g., "Section A", "Group 2", etc.). The information must apply generally to the whole batch for the 3rd semester. If the message violates these rules, set action to "Ignore".

Message from "${source}" by "${sender}": "${messageText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PARSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    // Only return parsed object, client will save it
    return res.json({ parsed, autoApplied: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/incoming/whatsapp", (req, res) => {
  const { sender, message, groupName } = req.body;
  req.body.source = groupName ? `WhatsApp: ${groupName}` : `WhatsApp: ${sender || "Chat"}`;
  req.body.messageText = message || req.body.messageText;
  app._router.handle({ ...req, url: "/api/incoming/process" }, res);
});
app.post("/api/incoming/gmail", (req, res) => {
  req.body.source = "Gmail (College Email)";
  app._router.handle({ ...req, url: "/api/incoming/process" }, res);
});
app.post("/api/incoming/classroom", (req, res) => {
  req.body.source = "Google Classroom";
  app._router.handle({ ...req, url: "/api/incoming/process" }, res);
});

app.post("/api/workspace/sync", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: "No OAuth token provided." });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    
    const coursesRes = await classroom.courses.list({ courseStates: ['ACTIVE'] });
    const courses = coursesRes.data.courses || [];
    
    let generatedTasks = [];
    
    for (const course of courses.slice(0, 5)) { // process up to 5 courses
      const courseworkRes = await classroom.courses.courseWork.list({
        courseId: course.id,
        courseWorkStates: ['PUBLISHED'],
        orderBy: 'updateTime desc',
        pageSize: 5
      });
      const items = courseworkRes.data.courseWork || [];
      for (const item of items) {
        
        // Pass to Gemini to filter based on rules
        const ai = getGeminiClient();
        if (ai) {
           const prompt = `You are a filter for a CGU student tracker. Current date: 2026-09-05.
CRITICAL FILTERING RULES:
You must ONLY accept tasks that are relevant to:
- B.Tech CSE (Computer Science Engineering) department.
- 2nd Year students.
- 3rd Semester specific.
AND you MUST REJECT any information that is specific to a particular Group or Section (e.g., "Section A", "Group 2", etc.). 

Course Name: "${course.name}"
Assignment Title: "${item.title}"
Assignment Description: "${item.description || ''}"

If this assignment passes the rules (or doesn't explicitly violate them, assuming it applies to the user), respond with EXACTLY {"status": "accept"}. If it violates the rules (e.g. is for 3rd year, or is Section B only), respond with EXACTLY {"status": "reject"}. Respond in JSON format only.`;

           try {
             const response = await ai.models.generateContent({
               model: "gemini-3.6-flash",
               contents: prompt,
               config: { responseMimeType: "application/json" }
             });
             const parsedFilter = JSON.parse(response.text || "{}");
             if (parsedFilter.status === "reject") {
                continue; // Skip this assignment
             }
           } catch (err) {
             console.error("Filter error", err);
           }
        }

        let dueDateStr = new Date().toISOString();
        if (item.dueDate) {
           dueDateStr = new Date(item.dueDate.year, item.dueDate.month - 1, item.dueDate.day).toISOString();
        }
        
        generatedTasks.push({
          id: `classroom-${item.id}`,
          title: item.title,
          subject: course.name,
          type: "assignment",
          dueDate: dueDateStr,
          status: "pending",
          source: "Google Classroom",
          lastUpdated: new Date().toISOString()
        });
      }
    }
    
    // Return them to the client to save to Firestore
    res.json({ success: true, tasks: generatedTasks });
  } catch (error) {
    console.error("Workspace sync error:", error);
    res.status(500).json({ error: "Failed to sync with Workspace APIs." });
  }
});

app.post("/api/drive/export", async (req, res) => {
  const token = req.body.token;
  const tasks = req.body.tasks || [];
  if (!token) return res.status(401).json({ error: "Missing token in request body" });
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const fileMetadata = {
      name: `CGU_Academic_Tracker_Export_${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    };
    
    const csvHeader = "ID,Title,Subject,Type,Due Date,Status,Source,Last Updated\n";
    const csvRows = tasks.map(t => 
      `${t.id},"${t.title}","${t.subject}",${t.type},${t.dueDate},${t.status},"${t.source}",${t.lastUpdated}`
    ).join("\n");
    
    const media = {
      mimeType: 'text/csv',
      body: csvHeader + csvRows
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });
    
    res.json({ success: true, fileId: file.data.id });
  } catch (err) {
    console.error("Drive export error:", err);
    res.status(500).json({ error: "Failed to export to Google Drive" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
