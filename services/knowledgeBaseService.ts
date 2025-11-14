export async function askKnowledgeBase(question: string, context: string): Promise<string> {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'askKnowledgeBase',
      payload: { question, context },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get answer from knowledge base.');
  }

  const result = await response.json();
  return result.answer;
}
