import { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore.ts';
import { ChatInput } from './ChatInput.tsx';
import { QuickPrompts } from './QuickPrompts.tsx';
import { getAppEnv } from '../../lib/env.ts';
import maskLogo from '../../assets/mask-logo.png';
import guideLogo from '../../assets/guide-logo.png';

export function ChatPanel() {
  const { messages, isStreaming } = useStore();
  const env = getAppEnv();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative">

      {/* Env badge - top right */}
      <div className="absolute top-4 right-6 z-30">
        <span style={{ fontSize: 11, color: '#8996A4' }}>{env}</span>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth flex flex-col"
      >
        {isEmpty ? (
          /* Default State - Guide Section */
          <div className="min-h-full flex flex-col items-center justify-center px-8 py-12">
            <div className="flex flex-col items-center w-full max-w-[400px]">
              {/* Logo */}
              <div className="mb-5">
                <img src={guideLogo} alt="MASK" className="h-[40px] w-auto" />
              </div>

              {/* 사용 가이드 title */}
              <h2 className="text-[16px] font-[600] text-[#67727E] text-center mb-6">사용 가이드</h2>

              {/* Step list */}
              <ol className="flex flex-col mb-6 self-start">
                {[
                  '사용자 상태 설정',
                  '테스트 화면 업로드',
                  '구체적인 질문',
                ].map((step, i) => {
                  const isLast = i === 2;
                  return (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span className="w-6 h-6 rounded-full bg-[#8996A4] text-white text-[12px] font-[600] flex items-center justify-center">
                          {i + 1}
                        </span>
                        {!isLast && (
                          <div className="w-px h-3 bg-[#D0DAE4] my-1" />
                        )}
                      </div>
                      <span className={`text-[14px] font-[600] text-[#8996A4] leading-6 ${!isLast ? 'pb-5' : ''}`}>{step}</span>
                    </li>
                  );
                })}
              </ol>

              {/* 질문 원칙 tip box */}
              <div className="bg-[#E6E9F0] rounded-[20px] p-5 w-full">
                <p className="text-[13px] font-[500] text-[#8996A4] mb-3">질문 원칙</p>
                <ol className="flex flex-col gap-2">
                  {[
                    '"어때 보여요? 괜찮나요?"같은 디자인 평가를 요구하지 마세요.',
                    '"예/아니오" 답변만 할 수 있는 닫힌 질문과 "편한가요?" 같은 유도 질문을 피하세요.',
                    '"지금 작동을 다 본"같은 상황을 부여하세요.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-[13px] font-[600] text-[#8996A4] leading-[18px]">
                      <span className="flex-shrink-0">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ) : (
          /* Active State - Chat messages */
          <>
            <div className="flex-1" />
            <div className="flex justify-center w-full">
            <div className="w-[800px] flex flex-col gap-6 py-8">
              {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                const showCursor = isStreaming && isLastMessage && msg.role === 'ai-user';

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${msg.role === 'moderator' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'moderator' ? (
                      /* User question bubble */
                      <div className="max-w-[480px] bg-[#E6E9F0] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] rounded-br-[4px] px-[16px] py-[12px] text-[16px] text-[#2E394A] leading-[1.6]">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    ) : (
                      /* AI answer - text only, no bubble */
                      <div className="max-w-[680px] text-[16px] text-[#2E394A] leading-[1.7]">
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                          {showCursor && <span className="streaming-cursor" />}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}
      </div>

      {/* Footer / Input Area */}
      <div className="px-6 py-5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] shrink-0 z-10 w-full flex justify-center">
        <div className="w-[800px] flex flex-col gap-3">
          <QuickPrompts />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
