import { GoogleGenAI } from "@google/genai";

// This function runs on Netlify's servers, where process.env.API_KEY is securely available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const handler = async function(event: any) {
  if (!process.env.API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API key is not configured on the server." }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, payload } = JSON.parse(event.body);
    let result;

    switch (action) {
      case 'generateDailyBriefing': {
        const { tasks, users } = payload;
        const prompt = `
          As the pharmacy manager, create a concise daily briefing for the team based on the following task list and user data. 
          The briefing should be formatted in markdown.
          Today's date is ${new Date().toDateString()}.

          Highlight these key areas:
          1.  **Urgent & Overdue Tasks:** List any tasks that are overdue or have an "URGENT" priority. Mention who is assigned.
          2.  **Today's Priorities:** List tasks due today, grouped by priority (Urgent, Important, General).
          3.  **Upcoming Deadlines:** Briefly mention any important tasks due in the next 2 days.
          4.  **Team Focus:** Note any unassigned tasks that need attention.

          Keep it professional, clear, and actionable.

          **Task Data (JSON):**
          ${JSON.stringify(tasks, null, 2)}

          **User Data (JSON):**
          ${JSON.stringify(users.map(u => ({id: u.id, name: u.name})), null, 2)}
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        result = { report: response.text };
        break;
      }
      case 'askKnowledgeBase': {
        const { question, context } = payload;
        
        const systemInstruction = `You are an expert assistant for a pharmacy. Your sole purpose is to answer questions based ONLY on the provided text from a knowledge base document. Do not use any external knowledge. If the answer cannot be found in the document, you must state that you cannot find the information in the provided resource. Be friendly and professional.`;

        const contents = `DOCUMENT CONTENT:\n---\n${context}\n---\n\nQUESTION: ${question}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        result = { answer: response.text };
        break;
      }
      default:
        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid action.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || "An internal server error occurred." }),
    };
  }
};