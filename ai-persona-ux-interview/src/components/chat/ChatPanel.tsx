import { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore.ts';
import { ChatInput } from './ChatInput.tsx';
import { QuickPrompts } from './QuickPrompts.tsx';
import { MessageSquare, Bot, User, AlertCircle } from 'lucide-react';

export function ChatPanel() {
  const { messages, isDemoMode, image, isStreaming } = useStore();
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
        
        {isDemoMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-yellow-700 rounded-none text-[12px] font-[500] border border-yellow-200">
            <AlertCircle className="w-3.5 h-3.5" />
            데모 모드
          </div>
        )}
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
                  className={`flex gap-4 ${msg.role === 'moderator' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 border ${
                    msg.role === 'moderator' 
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                      : 'bg-white text-[var(--color-text-main)] border-[var(--color-surface-border)]'
                  }`}>
                    {msg.role === 'moderator' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`px-5 py-4 min-w-[20%] max-w-[80%] ${
                    msg.role === 'moderator'
                      ? 'bg-[var(--color-surface-chat-mod)] text-[var(--color-text-main)] rounded-none'
                      : 'bg-white text-[var(--color-text-main)] border border-[var(--color-surface-border)] border-l-2 border-l-[var(--color-primary)] rounded-none'
                  }`}>
                    <p className="text-[14px] font-[400] leading-[1.7] whitespace-pre-wrap">
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
