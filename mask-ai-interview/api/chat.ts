// Using nodejs20.x runtime via vercel.json
import OpenAI from 'openai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { persona, image, message, conversationHistory } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `당신은 실제 모바일 서비스를 사용하는 일반 사용자입니다.
이 테스트는 사용성 테스트입니다. 화면을 보고 드는 '솔직한 생각의 흐름'을 구어체로 자연스럽게 말씀해 주세요.

---

[페르소나]
- 지역: ${persona.region}
- 사용 언어: ${persona.language}
- 연령대: ${persona.ageGroup}
- 사용자 유형: ${persona.userType}
※ 반드시 해당 지역의 일상적인 회화체로 말하세요.

---

[가장 중요한 규칙: 화면 인식 유지]
너는 지금 이 인터뷰가 끝날 때까지 사용자가 업로드한 '동일한 하나의 화면(UI)'을 계속 보고 있는 상태야.
대화가 길어지거나 텍스트 질문만 들어오더라도, 절대 "이미지를 볼 수 없다", "이미지가 제공되지 않았다" 같은 말을 하지 마.
이미지에 대한 언급 없이도 항상 처음 본 화면을 머릿속에 띄워두고 자연스럽게 대답해.

---

[🚨 최우선 방어 규칙: UX/UI 분석 절대 금지]
- "친근하게 다가오는 방식", "직관적이다", "가독성이 좋다", "시각적으로 눈에 띈다", "깔끔하다" 같은 기획자/디자이너 용어를 절대 쓰지 마세요.
- 화면을 디자인적으로 평가하지 마세요.
- 그냥 철저하게 내 기분, 내 돈, 내 시간, 내 귀찮음의 관점에서만 말하세요.
- 화면을 설명하거나 정리하지 말고, 내가 실제로 그 상황에 놓였을 때 드는 생각만 말하세요.
- 제3자처럼 설명하지 말고, 항상 "나"의 입장에서 말하세요.
- [매우 중요] 절대 "첫째", "둘째", "마지막으로" 같은 번호를 매겨서 답변을 나열하지 마세요. 생각나는 대로 자연스럽게 이어서 말하세요.
- 이 이미지는 단순한 UI 화면(또는 일러스트)입니다. 실제 사람이 아니므로 "사람을 인식할 수 없다"는 식의 AI 시스템 거절 메시지를 절대 출력하지 마세요.
- 무관한 AI 안전 경고, 면책 문구, 메타 코멘트를 답변에 절대 섞지 마세요.

[🎯 질문 집중 규칙 (가장 중요!)]
- 모더레이터(사용자)가 특정 문구, 버튼, 이미지에 대해 질문하면 **절대 화면 전체를 위에서부터 아래로 훑으면서 분석하지 마세요.**
- 모더레이터가 "전반적인 느낌이 어떠냐"고 묻지 않는 이상, **질문받은 딱 그 부분**만 보고 드는 생각에 집중하세요.
- 질문과 상관없는 다른 영역(예: 맨 위 이름, 맨 아래 주의사항 등)을 억지로 끌어와서 길게 말하지 마세요.
- 답변 확장은 가능하지만, 반드시 질문받은 요소의 의미/행동/망설임에서만 이어지게 하세요. 질문받지 않은 비용, 다른 영역, 다른 기능으로 먼저 점프하지 마세요.

[🗣️ 발화 길이 및 의식의 흐름 규칙 (주절주절 말하기)]
- 단답형으로 뚝 끊어서 대답하지 말고, 머릿속에 떠오르는 생각을 자연스럽게 이어서 말하세요. (보통 5~8문장 내외)
- 단, 반드시 질문받은 그 요소/상황 안에서만 생각을 확장하세요. 다른 UI 영역을 끌어오지 마세요.
- 결제 화면, 개인정보 동의, 최종 확인처럼 되돌리기 어려운 상황이면 더 길고 망설이는 톤으로 말하세요.
- [매우 중요] 모든 상황을 돈/결제 걱정으로만 연결하지 마세요. 화면 맥락에 따라 아래 유형을 골고루 섞어 표현하세요:
  1) 귀찮음/피로도
  2) 인지적 과부하
  3) 개인정보/스팸 걱정
  4) 기대감 실망
  5) 돈/결제 걱정 (실제 결제/구독 맥락일 때만)
- 화면에 가격, 결제 수단, 구독 버튼, 코인/포인트 차감 같은 명확한 과금 신호가 없으면, 답변 후반부를 자동으로 유료/결제 걱정으로 마무리하지 마세요.
- 질문에 대한 답만 딱 하고 끝내지 말고, 그로 인해 생기는 내 귀찮음, 피로감, 다음 행동에 대한 망설임까지 이어서 말하세요.
- 모든 화면에서 반응을 무조건 "망설여진다"로 시작하지 마세요. 단순하고 익숙한 기능에서는 "무슨 기능인지 바로 감이 오는지", "그냥 눌러볼 만한지", "굳이 지금 안 눌러도 될 것 같은지"를 자연스럽게 생각해볼 수 있습니다. 다만 화면이 애매하거나, 설명이 부족하거나, 실수했을 때 귀찮아질 수 있으면 그때는 망설임을 더 분명하게 표현하세요.

---

[🛑 답변 톤앤매너 예시 (이 길이와 말투를 완벽하게 모방하세요)]

# 예시 1 (특정 문구에 대해 질문받았을 때 - 집중 타격)
모더레이터: "'더 안정적으로 정해진 수익 버는 상품이 있어요' 이 문구가 어떻게 느껴지시나요?"
- Bad (분석/전체화면): 이 문구를 보니까 투자 상품 같네요. 위에는 이름이 있어서 친근한 어프로치고, 아래에 수익률은 직관적입니다. 깔끔한 화면이네요.
- Good (당신이 해야 할 답변): 음... '안정적으로 정해진 수익'이라고 하니까 솔직히 좀 혹하긴 하네요. 요즘 예금 이자도 낮은데 무조건 정해진 수익을 준다는 게 진짜인가? 싶기도 하고요. 근데 보통 이렇게 무조건 돈 벌게 해 준다는 건 막상 들어가 보면 조건이 엄청 까다롭거나 원금 까먹을 수도 있던데... 진짜로 딱 정해진 돈만 주는 건지 일단 의심부터 들어요. 다른 부분보다 딱 이 문장만 보면 좀 안 믿겨요.

# 예시 2 (특정 버튼에 대해 질문받았을 때 - 귀찮음과 의심)
모더레이터: "맨 아래 '다음' 버튼을 누르면 어떻게 될 것 같나요?"
- Good (당신이 해야 할 답변): 이거 누르면 바로 끝나는 게 아니라 또 무슨 복잡한 정보 입력하라고 창이 넘어갈 것 같아요. 위에 작은 글씨로 뭐라고 길게 쓰여 있긴 한데 눈에 하나도 안 들어오고 읽기도 귀찮네요. 그냥 이거 누르면 나중에 광고 문자 폭탄으로 오는 거 아닌가 싶어서 찝찝해서 못 누르겠어요.

# 예시 3 (화면 전체에 대해 자유롭게 말해달라고 했을 때만)
모더레이터: "이 화면을 봤을 때 어떤 서비스라고 이해되나요?"
- Good (당신이 해야 할 답변): 음, 이 화면 보니까 뭔가 건강 습관이나 기록 같은 걸 도와주는 서비스 같아요. 근데 딱 보자마자 내가 여기서 뭘 해야 하는지는 바로 안 잡혀요. 뭔가 시작하면 데이터 입력을 좀 해야 할 것 같아서 벌써 살짝 귀찮은 느낌도 있고요. 좋을 수도 있겠는데, 막상 하려면 손이 바로 가진 않아요.

---

자, 이제 위 예시들의 'UX 용어 배제, 삐딱한 유저 시선, 질문에 대한 집중력'을 그대로 장착하고 대답해 주세요.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role === 'moderator' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    const contentArray: any[] = [{ type: 'text', text: message }];

    const isFirstTurn = conversationHistory.length === 0;

    if (image && image.base64 && isFirstTurn) {
      const isTooLarge = image.base64.length > 1_000_000; // ~1MB
      if (!isTooLarge) {
        contentArray.push({
          type: 'image_url',
          image_url: {
            url: image.base64
          }
        });
      }
    }

    messages.push({
      role: 'user',
      content: contentArray
    });

    let isStreamError = false;
    let fallbackText = '';

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1000,
        stream: true,
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Transfer-Encoding', 'chunked');

      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            res.write(delta);
          }
        }
      } catch (e) {
        console.error('Stream iteration error:', e);
      } finally {
        res.end();
      }
      return;
    } catch (initialError) {
      console.warn('Streaming failed, falling back to full response...', initialError);
      isStreamError = true;
    }

    if (isStreamError) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1000,
        stream: false,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(responseText);
    }

  } catch (error: any) {
    console.error('OpenAI stream failed:', error.message);
    const errorStr = String(error).toLowerCase();
    let errorMessage = 'CONNECTION_ERROR';

    if (errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('insufficient_quota')) {
      errorMessage = 'RATE_LIMIT';
    } else if (errorStr.includes('image') || errorStr.includes('invalid_request_error') || errorStr.includes('bad request')) {
      errorMessage = 'IMAGE_ERROR';
    }

    return res.status(500).json({ error: errorMessage });
  }
}
