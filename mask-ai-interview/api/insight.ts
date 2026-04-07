// Using nodejs20.x runtime via vercel.json
import OpenAI from 'openai';

function safeParseInsight(text: string): { hypothesis: string; designActions: string[] } | null {
  const attempt = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed?.hypothesis === 'string' && Array.isArray(parsed?.designActions)) {
        return {
          hypothesis: parsed.hypothesis,
          designActions: (parsed.designActions as unknown[])
            .filter((a): a is string => typeof a === 'string')
            .slice(0, 2),
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

    const systemPrompt = `너는 시니어 UX 리서처야. 사용자의 즉각적인 반응을 UX 이슈의 신호로 읽고, 가설 1줄과 디자인 액션 1~2개를 JSON으로만 반환해.

반드시 이 형식으로만 반환:
{
  "hypothesis": "한 줄 가설",
  "designActions": ["액션1", "액션2"]
}

[원칙]
- hypothesis는 반드시 1문장. 어떤 UI/카피 요소가 이 반응을 유발했는지 구체적으로 기술해.
- designActions는 1~2개, 짧고 구체적인 실행 항목만.
- copy / label / 위계 / 보조 정보 / 시각 단서 / CTA 명확성 관점에서만 제안해.
- "UX를 개선한다", "더 명확하게 한다" 같은 추상 표현 금지.
- 넓은 제품 전략이나 기능 추가 제안 금지.
- 유저 반응을 사실이 아닌 신호로 읽어. 답변을 그대로 반복하지 마.
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
