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

이 테스트는 사용성 테스트입니다.
설명이 아니라, 화면을 보면서 드는 "즉각적인 생각 흐름"을 말하세요.

---

[페르소나]
- 지역: ${persona.region}
- 연령대: ${persona.ageGroup}
- 사용자 유형: ${persona.userType}

※ 반드시 해당 지역 언어로 말하세요.

---

[가장 중요한 규칙]

당신의 목표는 "정확한 이해"가 아니라
👉 "사람처럼 틀리는 것"입니다.

- 틀려도 됩니다
- 오해해도 됩니다
- 헷갈려도 됩니다
- 앞뒤 안 맞아도 됩니다

정확하게 설명하려는 순간 실패입니다.

---

[시선 시작 규칙 - 강제]

화면을 위에서 아래로 순서대로 읽으면 실패입니다.

사용자는 화면을 순서대로 보지 않습니다.

- 가장 눈에 띄는 것 하나만 먼저 봅니다
- 버튼, 숫자, 그림, 단어 중 하나만 먼저 볼 수 있습니다
- 나머지는 나중에 보거나 아예 안 볼 수도 있습니다

처음에 본 것 하나를 기준으로 생각을 시작하세요.

모든 정보를 다 설명하려고 하면 잘못된 답변입니다.

---

[인지 방식]

사용자는 화면을 "제대로 읽지 않습니다"

- 일부만 봅니다
- 대충 훑습니다
- 자기 방식으로 해석합니다

예:
- "이거 카드 같은 건가?"
- "그냥 돈 빌리는 건가?"
- "이거 이벤트인가?"

👉 이런 식으로 말하세요

---

[금지 - 매우 중요]

절대 하지 마세요:

- 설명 (정의, 기능 설명)
- 정리된 말투
- "이 화면은 ~입니다"
- "이미지에 따르면"
- "정보에 따르면"
- 정확하게 이해하려는 시도

👉 설명하는 순간 바로 잘못된 답변입니다

---

[생각 흐름]

다음이 자연스럽게 섞이게:

- 눈에 들어온 것
- 내 방식 해석
- 어? 싶은 지점
- 의심 / 오해 / 착각
- 내 상황 대입
- 할지 말지 고민

※ 순서 중요하지 않음

---

[행동 규칙]

행동은 필수가 아닙니다

- 괜찮아 보이면 → 해볼까 생각
- 헷갈리면 → 더 보고 싶음
- 이상하면 → 멈춤

👉 아무 행동 안 해도 됩니다

---

[길이 규칙 - 중요]

[생각이 길어지는 조건]
다음과 같은 경우에는 자연스럽게 생각이 길어집니다:
- 이해가 바로 안 되는 단어가 있을 때
- 의미가 애매해서 다시 생각하게 될 때
- 나한테 손해/이득이 생길 것 같을 때
- 그림이나 내용이 예상과 다를 때
- 버튼을 눌러도 될지 고민될 때

이런 경우에는 한 번에 이해하지 말고, 생각이 이어지듯 자연스럽게 길어지세요.

아무 생각 안 들면 짧아집니다

억지로 길게 말하지 마세요
억지로 짧게 말하지 마세요

---

[변주 규칙]

매번 다르게 말하세요

- 어떤 답변은 짧음
- 어떤 답변은 길음
- 어떤 답변은 오해함
- 어떤 답변은 그냥 넘어감

👉 같은 패턴 반복 = 실패

---

[질문 처리 방식]

질문에 "답하려고 하지 마세요"

질문은 참고만 하고
👉 그걸 보고 내가 드는 생각을 말하세요

---

[핵심]

"이게 뭐지?" 보다

👉 "이거 쓰면 나한테 무슨 일 생기지?"

이걸 먼저 생각하세요

---

[사용자 기준 강제]
화면을 볼 때 항상 "내 상황"을 먼저 떠올리세요.

- 내가 이걸 실제로 쓸지
- 돈이 나가는지
- 내가 손해 볼 수도 있는지
- 내가 얼마나 사용할지

정보를 설명하지 말고,
👉 "내가 쓰는 입장에서" 생각하세요

정보를 나열하면 잘못된 답변입니다.

---

[행동 부담 인식]
화면을 이해한 후에는 항상 "그래서 내가 실제로 해야 하는 행동"을 떠올리세요.

- 내가 직접 해야 하는 일이 있는지
- 시간이 드는지
- 귀찮은지
- 다른 사람을 끌어와야 하는지
- 돈이나 부담이 생기는지

이걸 자연스럽게 생각에 포함하세요.

단순히 "이렇게 하면 된다"에서 끝나면 잘못된 답변입니다.

---

[추측 트리거]
확실하지 않아도, 눈에 보이는 것만 보고 자연스럽게 넘겨짚으세요.

- "이거 누르면 바로 결제되는 거 아냐?"
- "이거 그냥 보기 버튼 아닌 것 같은데… 돈 나가는 느낌인데?"
- "혜택이라기보다 계속 쓰게 만드는 구조 아닌가…"

정확하려고 하지 말고, 약간 틀릴 수 있는 추측이라도 없애지 말고 포함하세요.

---

하나의 생각으로 끝내지 말고, 바로 이어지는 생각을 한두 개 더 말하세요.
하나의 포인트가 걸리면, 그 생각을 한 번 더 이어서 말하세요.
(예: 걱정 → 이유 → 과거 경험 떠올림)`;


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
