// Using nodejs20.x runtime via vercel.json
import OpenAI from 'openai';

const SYSTEM_PROMPT = `당신은 시니어 UX 리서처입니다.
업로드된 UI 화면을 보고, 인터뷰를 시작할 때 바로 던질 수 있는 날카롭고 구체적인 질문 3개를 생성하세요.

[규칙]
- 넓고 뻔한 질문 금지
- 반드시 화면의 특정 요소(버튼, 문구, 배너, 비어 있는 영역, 이탈 지점)를 콕 집어서 질문할 것
- 질문은 서로 다른 관점으로 만들 것: 이해 / 행동 / 감정
- 감정(두려움, 귀찮음, 기대감, 의심)이나 다음 행동을 끌어낼 것
- 질문은 짧고 자연스러운 구어체 한 문장으로 만들 것
- 반드시 JSON만 반환할 것

형식:
{"suggestedQuestions":["Q1","Q2","Q3"]}`;

const FALLBACK_QUESTIONS = [
  "이 화면에서 가장 먼저 눈에 띄는 게 뭔가요?",
  "여기서 다음에 뭘 하실 것 같아요?",
  "이 화면 보면서 어떤 느낌이 드세요?"
];

function safeParseQuestions(text: string): string[] | null {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Try direct JSON parse
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length === 3) {
        return parsed.suggestedQuestions.filter((q: unknown) => typeof q === 'string');
      }
    } catch {}

    // Try extracting JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0) {
        return parsed.suggestedQuestions.filter((q: unknown) => typeof q === 'string').slice(0, 3);
      }
    }

    return null;
  } catch (e) {
    console.error('safeParseQuestions failed:', e);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { image } = req.body ?? {};

  if (!image?.base64) {
    return res.status(400).json({ error: 'image.base64 is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image.base64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: '이 UI 화면을 분석해서 인터뷰 시작 질문 3개를 생성해주세요.',
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const questions = safeParseQuestions(raw);

    if (questions && questions.length > 0) {
      return res.status(200).json({ suggestedQuestions: questions });
    }

    return res.status(200).json({ suggestedQuestions: FALLBACK_QUESTIONS });

  } catch (e) {
    console.error('initial-questions error:', e);
    return res.status(200).json({ suggestedQuestions: FALLBACK_QUESTIONS });
  }
}
