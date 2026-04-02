import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useStore, type Message } from '../../store/useStore.ts';
import { generatePersonaReply } from '../../lib/openai.ts';
import { generateFollowUpQuestions } from '../../lib/followUp.ts';
import { generateInitialQuestions } from '../../lib/initialQuestions.ts';

let callId = 0;

export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const lastImageIdRef = useRef<string | null>(null);

  const {
    image, persona, messages,
    addMessage, updateLastMessage,
    isStreaming, setStreaming,
    initialQuestions,
    setInitialQuestions, setIsGeneratingInitialQuestions, clearInitialQuestions,
    clearFollowUpQuestions,
    setIsGeneratingFollowUp,
    setFollowUpQuestions,
  } = useStore();

  // Generate initial questions once when a new image is uploaded (before any messages)
  useEffect(() => {
    if (!image?.base64) {
      clearInitialQuestions();
      lastImageIdRef.current = null;
      return;
    }
    // Only generate if this is a new image and conversation hasn't started
    if (image.id === lastImageIdRef.current) return;
    if (messages.length > 0) return;

    lastImageIdRef.current = image.id;
    setIsGeneratingInitialQuestions(true);

    generateInitialQuestions(image)
      .then((questions) => {
        setInitialQuestions(questions);
      })
      .catch(() => {
        clearInitialQuestions();
      })
      .finally(() => {
        setIsGeneratingInitialQuestions(false);
      });
  }, [image]); // Only watch image — intentionally excludes messages to avoid re-triggering

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || inputValue.trim();
    if (!textToSend || !image || isStreaming) return;

    // Clear initial questions on first send
    if (messages.length === 0 && initialQuestions.length > 0) {
      clearInitialQuestions();
    }

    setInputValue('');
    setStreaming(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'moderator',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    addMessage(userMessage);

    const aiMessageId = crypto.randomUUID();
    const aiMessageCreatedAt = new Date().toISOString();
    addMessage({
      id: aiMessageId,
      role: 'ai-user',
      content: '',
      createdAt: aiMessageCreatedAt
    });

    try {
      let accumulatedText = '';
      await generatePersonaReply(
        persona,
        image,
        textToSend,
        messages,
        (chunk) => {
          accumulatedText += chunk;
          updateLastMessage(accumulatedText);
        }
      );

      // Fire and forget follow-up questions generation
      const currentCall = ++callId;
      setIsGeneratingFollowUp(true);

      generateFollowUpQuestions(accumulatedText)
        .then((q) => {
          console.log("follow-up:", q);
          if (currentCall === callId) {
            clearFollowUpQuestions();
            setFollowUpQuestions(q);
          }
        })
        .catch((e) => {
          console.error("follow-up error:", e);
          if (currentCall === callId) {
            setFollowUpQuestions([]);
          }
        })
        .finally(() => {
          if (currentCall === callId) {
            setIsGeneratingFollowUp(false);
          }
        });


    } catch (error: any) {
      console.error('Failed to send message:', error);

      let errorMessage = '서버 연결 오류: 서버에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.';
      if (error.message.includes('API_SERVER_DOWN')) {
        errorMessage = '로컬 API 서버 연결 실패: 로컬 API 서버가 실행되지 않았습니다. 터미널에서 백엔드 서버(vercel dev)를 포트 3000으로 실행해주세요.';
      } else if (error.message.includes('RATE_LIMIT')) {
        errorMessage = 'API 한도 초과: 서비스 이용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('IMAGE_ERROR')) {
        errorMessage = '이미지 오류: 첨부된 이미지를 처리할 수 없습니다. 다른 이미지를 업로드해주세요.';
      }

      updateLastMessage(errorMessage);
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
      const { prompt, autoSend } = e.detail;
      if (autoSend) {
        handleSend(prompt);
      } else {
        setInputValue(prompt);
        // We could also run focus() if we had a ref on the textarea
      }
    };
    window.addEventListener('quick-prompt-action', handleQuickPrompt);
    return () => window.removeEventListener('quick-prompt-action', handleQuickPrompt);
  }, [image, persona, messages, isStreaming]);

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
