import type { UploadedImage } from '../store/useStore.ts';

const FALLBACK_QUESTIONS = [
  "이 화면에서 가장 먼저 눈에 띄는 게 뭔가요?",
  "여기서 다음에 뭘 하실 것 같아요?",
  "이 화면 보면서 어떤 느낌이 드세요?"
];

export async function generateInitialQuestions(
  image: UploadedImage
): Promise<string[]> {
  if (!image.base64) return FALLBACK_QUESTIONS;

  try {
    const response = await fetch('/api/initial-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: { base64: image.base64 } }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.suggestedQuestions) && data.suggestedQuestions.length > 0) {
        return data.suggestedQuestions;
      }
    }
  } catch (e) {
    console.error('initial-questions fetch error:', e);
  }

  return FALLBACK_QUESTIONS;
}
