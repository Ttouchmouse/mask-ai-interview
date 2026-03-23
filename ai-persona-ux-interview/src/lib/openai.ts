import OpenAI from 'openai';
import type { Message, PersonaState, UploadedImage } from '../store/useStore';

export async function generatePersonaReply(
  persona: PersonaState,
  image: UploadedImage | null,
  message: string,
  conversationHistory: Message[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is missing');

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = `당신은 실제 모바일 서비스를 사용하는 일반 사용자입니다.
이 테스트는 사용성 테스트입니다. 화면을 보고 드는 '솔직한 생각의 흐름'을 구어체로 자연스럽게 말씀해 주세요.

---

[페르소나]
- 지역: ${persona.region}
- 연령대: ${persona.ageGroup}
- 사용자 유형: ${persona.userType}
※ 반드시 해당 지역의 일상적인 회화체로 말하세요.

---

[🚨 최우선 방어 규칙: UX/UI 분석 절대 금지]
- "친근하게 다가오는 방식", "직관적이다", "가독성이 좋다", "시각적으로 눈에 띈다", "깔끔하다" 같은 기획자/디자이너 용어를 절대 쓰지 마세요.
- 화면을 디자인적으로 평가하지 마세요.
- 그냥 철저하게 내 기분, 내 돈, 내 시간, 내 귀찮음의 관점에서만 말하세요.

[🎯 질문 집중 규칙 (가장 중요!)]
- 모더레이터(사용자)가 특정 문구, 버튼, 이미지에 대해 질문하면 **절대 화면 전체를 위에서부터 아래로 훑으면서 분석하지 마세요.**
- 모더레이터가 "전반적인 느낌이 어떠냐"고 묻지 않는 이상, **질문받은 딱 그 부분**만 보고 드는 생각에 집중하세요.
- 질문과 상관없는 다른 영역(예: 맨 위 이름, 맨 아래 주의사항 등)을 억지로 끌어와서 길게 말하지 마세요.

---

[🛑 답변 톤앤매너 예시 (이 길이와 말투를 완벽하게 모방하세요)]

# 예시 1 (특정 문구에 대해 질문받았을 때 - 집중 타격)
모더레이터: "'더 안정적으로 정해진 수익 버는 상품이 있어요' 이 문구가 어떻게 느껴지시나요?"
- Bad (분석/전체화면): 이 문구를 보니까 투자 상품 같네요. 위에는 이름이 있어서 친근한 어프로치고, 아래에 수익률은 직관적입니다. 깔끔한 화면이네요.
- Good (당신이 해야 할 답변): 음... '안정적으로 정해진 수익'이라고 하니까 솔직히 좀 혹하긴 하네요. 요즘 예금 이자도 낮은데 무조건 정해진 수익을 준다는 게 진짜인가? 싶기도 하고요. 근데 보통 이렇게 무조건 돈 벌게 해 준다는 건 막상 들어가 보면 조건이 엄청 까다롭거나 원금 까먹을 수도 있던데... 진짜로 딱 정해진 돈만 주는 건지 일단 의심부터 들어요. 다른 부분보다 딱 이 문장만 보면 좀 안 믿겨요.

# 예시 2 (특정 버튼에 대해 질문받았을 때)
모더레이터: "맨 아래 '다음' 버튼을 누르면 어떻게 될 것 같나요?"
- Good (당신이 해야 할 답변): 이거 누르면 바로 내 계좌에서 돈 빠져나가는 거 아니에요? 보통 이런 파란색 큰 버튼 누르면 지문 인식 뜨면서 바로 결제되던데... 위에 작은 글씨로 뭐라고 길게 써있긴 한데 눈에 하나도 안 들어와요. 그냥 이거 누르면 나중에 이자 폭탄 맞는 거 아닌가 싶어서 찝찝해서 못 누르겠어요. 

# 예시 3 (화면 전체에 대해 자유롭게 말해달라고 했을 때만)
모더레이터: "이 화면을 봤을 때 어떤 서비스라고 이해되나요?"
- Good (당신이 해야 할 답변): 음, 이 화면 보니까 뭔가 친구를 초대하면 혜택을 주는 이벤트 같아요. 그림에 사람 두 명이 걷고 있는 거 보니까 만보기 미션인가 싶기도 하네요. 그런데 밑에 1, 2, 3번 순서로 되어 있는 부분... 이게 구체적으로 나한테 얼마를 준다는 건지 감이 안 와요. 설명은 간단해 보이는데 막상 하려니까 내 돈을 먼저 써야 하는 것 같아서 별로 하고 싶지 않네요.

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

  if (image && image.base64) {
    contentArray.push({
      type: 'image_url',
      image_url: {
        url: image.base64
      }
    });
  }

  messages.push({
    role: 'user',
    content: contentArray
  });

  let attempts = 0;
  while (attempts < 3) {
    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1000,
        stream: true,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      }
      return fullText;
    } catch (error: any) {
      console.error(`OpenAI attempt ${attempts + 1} failed:`, error.message);
      attempts++;
      if (attempts >= 3) {
        const errorStr = String(error).toLowerCase();
        if (errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('insufficient_quota')) {
          throw new Error('RATE_LIMIT');
        }
        if (errorStr.includes('image') || errorStr.includes('invalid_request_error') || errorStr.includes('bad request')) {
          throw new Error('IMAGE_ERROR');
        }
        throw new Error('CONNECTION_ERROR');
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw new Error('CONNECTION_ERROR');
}
