const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/incoming\/process", async \(req, res\) => \{[\s\S]*?(?=\}\);\n\n\/\/ Dedicated webhook)/;

code = code.replace(regex, 
`app.post("/api/incoming/process", async (req, res) => {
  try {
    const { source, sender, messageText, autoApply } = req.body;
    if (!messageText) {
      return res.status(400).json({ error: "messageText is required" });
    }
    const ai = getGeminiClient();
    if (!ai) return res.status(500).json({ error: "Gemini not configured" });

    const prompt = \`You are an automated academic work parser for a CGU student. Current date: 2026-09-05.\\nCalendar ground truth: \${JSON.stringify(CGU_ACADEMIC_CALENDAR.events)}\\nMessage from "\${source}" by "\${sender}": "\${messageText}"\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-8b",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PARSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text() || "{}");
    return res.json({ parsed, autoApplied: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
`);

fs.writeFileSync('server.ts', code);
