import type { Message, PersonaState, UploadedImage } from '../store/useStore';

export async function generatePersonaReply(
  persona: PersonaState,
  image: UploadedImage | null,
  message: string,
  conversationHistory: Message[],
  onChunk: (chunk: string) => void
): Promise<string> {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona,
          image,
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'CONNECTION_ERROR';
        if (response.status === 504 || response.status === 502) {
          errorMessage = 'API_SERVER_DOWN';
        } else {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // Error parsing json, keep fallback
          }
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('CONNECTION_ERROR');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          fullText += chunk;
          onChunk(chunk);
        }
      }

      return fullText;
    } catch (error: any) {
      console.error(`Fetch attempt ${attempts + 1} failed:`, error.message);
      attempts++;
      if (attempts >= 3) {
        if (error.message.includes('fetch') || error.message === 'API_SERVER_DOWN') {
          throw new Error('API_SERVER_DOWN');
        }
        throw error;
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw new Error('API_SERVER_DOWN');
}
