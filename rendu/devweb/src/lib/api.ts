const OLLAMA_URL = 'http://localhost:11434';

const SYSTEM_PROMPT = `Tu es un assistant financier expert de TechCorp Industries. Tu réponds TOUJOURS en français. Sois concis et clair dans tes explications, mais développe en détail si l'utilisateur te le demande spécifiquement.`;

export async function* streamGenerate(
  prompt: string,
  model = 'phi3-financial',
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      stream: true,
      options: { num_predict: -1 },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) yield json.message.content;
      } catch {
        // skip malformed lines
      }
    }
  }
}
