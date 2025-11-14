import { User, Task } from '../types';

export async function generateDailyBriefing(tasks: Task[], users: User[]): Promise<string> {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generateDailyBriefing',
      payload: { tasks, users },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate briefing.');
  }

  const result = await response.json();
  // Fix: The result from the Netlify function is an object { report: "..." }, extract the report text.
  return result.report;
}
