export async function generateFollowUpQuestions(
  lastResponse: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastResponse }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error("follow-up fetch error:", e);
  }

  // 🔥 fallback (UX 끊김 방지)
  return [
    "어떤 부분이 가장 걸리셨어요?",
    "조금 더 설명해주실 수 있을까요?",
    "왜 그렇게 느끼셨어요?"
  ];
}
