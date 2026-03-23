import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useStore, type Message } from '../../store/useStore.ts';
import { generatePersonaReply } from '../../lib/openai.ts';
import { supabase } from '../../lib/supabase.ts';

export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const {
    sessionId, setSessionId,
    image, persona, messages,
    addMessage, appendToLastMessage,
    isStreaming, setStreaming,
  } = useStore();

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || inputValue.trim();
    if (!textToSend || !image || isStreaming) return;

    setInputValue('');
    setStreaming(true);

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      setSessionId(currentSessionId);

      supabase.from('sessions').insert({
        id: currentSessionId,
        created_at: new Date().toISOString(),
        persona: persona,
        image_name: image.name || 'uploaded_image'
      }).then(({ error }) => {
        if (error) console.error('Supabase session insert error:', error);
      });
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'moderator',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    addMessage(userMessage);

    supabase.from('messages').insert({
      id: userMessage.id,
      session_id: currentSessionId,
      role: userMessage.role,
      content: userMessage.content,
      created_at: userMessage.createdAt
    }).then(({ error }) => {
      if (error) console.error('Supabase user msg insert error:', error);
    });

    // Add an empty AI message placeholder that will be filled via streaming
    const aiMessageId = crypto.randomUUID();
    const aiMessageCreatedAt = new Date().toISOString();
    addMessage({
      id: aiMessageId,
      role: 'ai-user',
      content: '',
      createdAt: aiMessageCreatedAt
    });

    try {
      const fullText = await generatePersonaReply(
        persona,
        image,
        textToSend,
        messages,
        (chunk) => appendToLastMessage(chunk)
      );

      // Save completed AI message to Supabase
      supabase.from('messages').insert({
        id: aiMessageId,
        session_id: currentSessionId,
        role: 'ai-user',
        content: fullText,
        created_at: aiMessageCreatedAt
      }).then(({ error }) => {
        if (error) console.error('Supabase AI msg insert error:', error);
      });

    } catch (error: any) {
      console.error('Failed to send message:', error);

      let errorMessage = '서버 연결 오류: 서버에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.';
      if (error.message.includes('RATE_LIMIT')) {
        errorMessage = 'API 한도 초과: 서비스 이용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('IMAGE_ERROR')) {
        errorMessage = '이미지 오류: 첨부된 이미지를 처리할 수 없습니다. 다른 이미지를 업로드해주세요.';
      }

      // Replace the empty placeholder with the error message
      appendToLastMessage(errorMessage);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleQuickPrompt = (e: any) => {
      handleSend(e.detail);
    };
    window.addEventListener('send-quick-prompt', handleQuickPrompt);
    return () => window.removeEventListener('send-quick-prompt', handleQuickPrompt);
  }, [image, persona, messages, isStreaming, sessionId]);

  const disabled = !image || isStreaming;

  return (
    <div className="relative flex items-end gap-4 w-full">
      <div className="flex-1 bg-white border-b border-[var(--color-surface-border)] p-1 focus-within:border-[var(--color-primary)] transition-colors rounded-none">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !image
              ? '인터뷰를 시작하려면 먼저 이미지를 업로드하세요...'
              : isStreaming
              ? '응답 중...'
              : '질문을 입력해주세요... (Shift+Enter 줄바꿈)'
          }
          disabled={disabled}
          className="w-full max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-2 px-2 text-[14px] font-[400] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
          rows={1}
        />
      </div>

      <button
        onClick={() => handleSend()}
        disabled={disabled || !inputValue.trim()}
        className="w-12 h-12 mb-1 shrink-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-surface-border)] text-white rounded-[6px] flex items-center justify-center transition-colors shadow-none"
      >
        <Send className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}
