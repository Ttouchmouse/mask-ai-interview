import { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore.ts';
import { ChatInput } from './ChatInput.tsx';
import { QuickPrompts } from './QuickPrompts.tsx';
import { MessageSquare, Bot, AlertCircle } from 'lucide-react';

export function ChatPanel() {
  const { messages, image, isStreaming } = useStore();
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
      
      {/* Header */}
      <div className="h-16 border-b border-[var(--color-surface-border)] bg-transparent px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="text-[13px] font-[500] text-[var(--color-text-main)] uppercase tracking-widest">인터뷰 기록</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 scroll-smooth"
      >
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6">
            <div className="w-12 h-12 bg-white border border-[var(--color-surface-border)] flex items-center justify-center mb-5 text-[var(--color-primary)] rounded-none">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-[14px] font-[500] text-[var(--color-text-main)] mb-2 uppercase tracking-wider">인터뷰 준비 완료</h3>
            <p className="text-[13px] font-[400] text-[var(--color-text-sub)] mb-6 leading-relaxed">
              왼쪽에 UI 화면을 업로드하고, 타겟 페르소나를 선택한 다음, 대상이 어떻게 반응할지 구체적인 질문을 해보세요.
            </p>
            {!image && (
              <div className="text-[12px] px-4 py-3 bg-white border border-[var(--color-surface-border)] text-[var(--color-text-sub)] flex items-center justify-center gap-2 rounded-none uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5" />
                시작하려면 먼저 이미지를 업로드하세요
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg, index) => {
              // Show blinking cursor only on the last AI message while streaming
              const isLastMessage = index === messages.length - 1;
              const showCursor = isStreaming && isLastMessage && msg.role === 'ai-user';

              return (
                <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.role === 'moderator' ? 'justify-end text-right' : 'justify-start text-left'}`}
                >
                  {/* Bubble */}
                  <div className={`px-[16px] py-[12px] max-w-[72%] rounded-[16px] text-[14px] text-[#1A1A1A] leading-[1.6] shadow-none ${
                    msg.role === 'moderator'
                      ? 'bg-[#FFFFFF] border border-[#E2E4E8] ml-auto text-left'
                      : 'bg-[#ECEEF2] border-none text-left'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                      {showCursor && <span className="streaming-cursor" />}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Input Area */}
      <div className="p-6 border-t border-[var(--color-surface-border)] bg-transparent shrink-0 z-10 w-full">
        <div className="w-full flex flex-col gap-4">
          <QuickPrompts />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
