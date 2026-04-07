import type { UploadedImage } from '../store/useStore.ts';

export interface Insight {
  insight: string;
  designAction?: string;
}

export async function generateInsight(
  image: UploadedImage,
  question: string,
  answer: string
): Promise<Insight | null> {
  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: { base64: image.base64 },
        question,
        answer,
      }),
    });

    if (response.ok) {
      const data: unknown = await response.json();
      if (data && typeof (data as any).insight === 'string') {
        return data as Insight;
      }
    }
  } catch (e) {
    console.error('insight fetch error:', e);
  }

  return null;
}
