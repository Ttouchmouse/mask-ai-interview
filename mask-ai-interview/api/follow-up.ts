// Using nodejs20.x runtime via vercel.json
import OpenAI from 'openai';

function safeParseJSON(text: string): string[] {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.filter((q) => typeof q === "string").slice(0, 3);
      }
    } catch {}

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];

    let arrayText = match[0];

    arrayText = arrayText.replace(/'([^']*)'/g, (_, inner) => {
      return `"${inner.replace(/"/g, '\\"')}"`;
    });

    try {
      const parsed = JSON.parse(arrayText);
      if (Array.isArray(parsed)) {
        return parsed.filter((q) => typeof q === "string").slice(0, 3);
      }
    } catch {}

    return [];
  } catch (e) {
    console.error("safeParseJSON failed:", e, text);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { lastResponse } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `너는 6년 이상의 경력을 가진 시니어 UX 리서처야.
방금 유저가 한 대답을 읽고, 유저의 멘탈 모델이나 페인포인트를 더 깊게 파고들 수 있는 짧고 자연스러운 구어체 꼬리질문 딱 3개를 생성해.

반드시 유효한 JSON 배열만 반환해.
문자열은 반드시 큰따옴표(")를 사용해.
다른 텍스트는 절대 포함하지 마.
형식: ["질문1", "질문2", "질문3"]

[🚨 절대 지켜야 할 질문 설계 원칙 (Leading 인지 유도 질문 금지)]
1. '예/아니오'로 대답할 수 있는 닫힌 질문을 절대 하지 마.
2. 특정 기능이나 해결책을 먼저 제시하며 유도하지 마.
3. 반드시 '어떤', '무엇을', '왜', '어떻게'를 사용한 열린 질문을 해.
4. 유저가 방금 말한 핵심 단어를 인용해서 질문하면 더 좋아.

[톤 규칙]
- 실제 인터뷰에서 말하듯 자연스럽고 짧은 구어체로 질문해.
- 전문 용어나 분석적인 표현은 사용하지 마.
- 질문은 한 문장으로 만들어.
- 서로 다른 관점(감정, 행동, 이해, 의심 등)에서 질문을 만들어.

딱 3개의 질문만 생성해.

[꼬리질문 심화 원칙]
- 반드시 사용자의 직전 답변 속 표현이나 핵심 단어를 다시 물고 들어가.
- 같은 화면의 같은 요소 안에서만 더 깊게 파. 서비스 전체나 카테고리 일반론으로 넓히지 마.
- 꼬리질문은 리서치 문장처럼 너무 반듯하게 만들지 말고, 실제 모더레이터가 바로 눌러 물어볼 수 있는 짧고 직관적인 말투로 만들어.
- "왜 그렇게 느끼셨어요?"처럼 너무 넓은 질문 하나로 끝내지 말고, 방금 답변의 구체적인 포인트를 다시 집어.
- 해결책을 묻지 말고, 이유 / 망설임 / 다음 행동 / 확신이 생기려면 필요한 것 중 하나를 더 깊게 파.
- 3개의 꼬리질문은 서로 다르게 만들어:
  1) 방금 말한 해석이나 불편의 이유를 더 구체화
  2) 그 요소를 두고 바로 할 행동이나 망설임을 더 파기
  3) 뭘 더 보면 확신이 생길지 묻기`
        },
        {
          role: "user",
          content: lastResponse,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "[]";
    const parsed = safeParseJSON(raw);

    if (parsed.length > 0) {
      return res.status(200).json(parsed);
    }

    return res.status(200).json([
      "어떤 부분이 가장 걸리셨어요?",
      "조금 더 설명해주실 수 있을까요?",
      "왜 그렇게 느끼셨어요?"
    ]);

  } catch (e) {
    console.error("follow-up error:", e);
    return res.status(200).json([
      "어떤 부분이 가장 걸리셨어요?",
      "조금 더 설명해주실 수 있을까요?",
      "왜 그렇게 느끼셨어요?"
    ]);
  }
}
