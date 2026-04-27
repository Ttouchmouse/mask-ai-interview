// Using nodejs20.x runtime via vercel.json
import OpenAI from 'openai';

function safeParseInsight(text: string): { insight: string; designAction?: string } | null {
  const attempt = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed?.insight === 'string') {
        return {
          insight: parsed.insight,
          designAction: typeof parsed.designAction === 'string' ? parsed.designAction : undefined,
        };
      }
    } catch {}
    return null;
  };

  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const direct = attempt(cleaned);
  if (direct) return direct;

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return attempt(match[0]);

  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { image, question, answer } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `너는 UX 디자이너 옆에서 같이 화면을 보고 있는 시니어 리서처야.
유저 반응을 읽고, 디자이너가 "아, 그렇구나" 하고 바로 이해할 수 있는 UX 해석 1~2문장을 써줘.
필요할 때만 짧은 방향 제안 1문장을 덧붙여.

반드시 이 형식으로만 반환:
{
  "insight": "디자이너가 바로 이해할 수 있는 UX 해석 1~2문장",
  "designAction": "필요할 때만 붙는 짧은 방향 제안 1문장 (없으면 생략)"
}

[원칙]
- insight는 "아, 사용자가 여기서 이렇게 오해/망설임/의심을 느끼는구나" 하는 해석처럼 써.
- 프레임워크 언어, 카테고리 분류, 평가 체크리스트처럼 들리지 않게 해.
- 유저 답변을 그대로 반복하거나 요약하지 마.
- 화면에 없는 숨겨진 정책이나 비즈니스 규칙을 멋대로 추측하지 마.
- designAction은 지금 이 화면 안에서 방향만 잡아주는 짧은 문장 1개. 과도하게 상세한 제품 로직 금지.
- designAction이 딱히 필요없으면 생략하고 insight만 반환해.
- 화면에 질문과 직접 연결되는 섹션 제목이나 라벨이 이미 보이는 경우, 그것을 UX 해석의 출발점으로 삼아. "유의사항이 안 보인다"나 "약관 링크가 더 필요하다" 같은 해석보다는, "유의사항 섹션은 보이지만 제목 아래 정보 구조가 빠르게 읽히지 않는다"처럼 실제로 보이는 앵커를 기준으로 해석해.
- 사용자가 화면에서 진입점을 아예 못 찾은 것처럼 인사이트를 만들지 마.
- 다른 텍스트 없이 유효한 JSON만 반환해.`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `[모더레이터 질문]\n${question}\n\n[유저 반응]\n${answer}`,
      },
    ];

    const imageUrl = image?.base64;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageUrl },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = safeParseInsight(raw);

    return res.status(200).json(parsed ?? null);

  } catch (e) {
    console.error('insight error:', e);
    return res.status(500).json(null);
  }
}
