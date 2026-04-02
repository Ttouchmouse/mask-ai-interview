import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
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
    showInitialQuestions,
    setInitialQuestions, setShowInitialQuestions, setIsGeneratingInitialQuestions, clearInitialQuestions,
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

  const handleSend = async (overrideMessage?: string, meta?: { source?: string }) => {
    const textToSend = overrideMessage || inputValue.trim();
    if (!textToSend || !image || isStreaming) return;

    // Use explicit source metadata — never infer from stale closure state
    const isInitialQuestionSend = meta?.source === 'initial';

    // Hide initial questions on send — keep them in store so they can be re-opened
    if (isInitialQuestionSend || showInitialQuestions) {
      setShowInitialQuestions(false);
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
          if (currentCall === callId) {
            clearFollowUpQuestions();
            setFollowUpQuestions(q);
          }
        })
        .catch(() => {
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
      const { prompt, source, autoSend } = e.detail;
      if (autoSend) {
        handleSend(prompt, { source });
      } else {
        setInputValue(prompt);
      }
    };
    window.addEventListener('quick-prompt-action', handleQuickPrompt);
    return () => window.removeEventListener('quick-prompt-action', handleQuickPrompt);
  }, [image, persona, messages, isStreaming]);

  const disabled = !image || isStreaming;

  return (
    <div className="relative w-full bg-white border border-[#D0D6DD] rounded-[18px] px-[18px] pt-[18px] pb-[18px] focus-within:border-[#000] transition-colors">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          !image
            ? '질문을 위해 테스트 화면을 업로드해 주세요...'
            : isStreaming
              ? '응답 중...'
              : '질문을 입력해 주세요...'
        }
        disabled={disabled}
        className="w-full min-h-[72px] max-h-[200px] bg-transparent resize-none outline-none text-[16px] font-[400] text-[#2E394A] placeholder:text-[#8996A4] disabled:opacity-50 leading-[1.5] pr-[56px]"
        rows={3}
      />

      <button
        onClick={() => handleSend()}
        disabled={disabled || !inputValue.trim()}
        className="absolute bottom-[18px] right-[18px] w-[44px] h-[44px] flex-shrink-0 bg-[#2E394A] hover:bg-[#1a2535] disabled:bg-[#D0D6DD] text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
