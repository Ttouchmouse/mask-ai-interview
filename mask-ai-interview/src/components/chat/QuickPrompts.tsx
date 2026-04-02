import type React from 'react';
import { useRef } from 'react';
import { RotateCcw, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore.ts';
import { generateInitialQuestions } from '../../lib/initialQuestions.ts';

const DEFAULT_PROMPTS = [
  "이 버튼이 무슨 역할을 한다고 생각하시나요?",
  "여기서 다음으로 무엇을 하시겠습니까?",
  "이 화면에서 헷갈리는 부분이 있나요?",
  "여기서 계속 진행하시겠습니까?",
  "망설여지는 부분이 있나요?"
];

const COOLDOWN_MS = 2500;

export function QuickPrompts() {
  const lastRegenerateRef = useRef<number>(0);

  const {
    image, isStreaming,
    initialQuestions, showInitialQuestions, isGeneratingInitialQuestions,
    setInitialQuestions, setShowInitialQuestions, setIsGeneratingInitialQuestions,
    followUpQuestions, isGeneratingFollowUp,
  } = useStore();

  const handlePromptClick = (e: React.MouseEvent, prompt: string, source: 'initial' | 'followup' | 'default', autoSend = false) => {
    if (!image || isStreaming) return;
    const event = new CustomEvent('quick-prompt-action', {
      detail: { prompt, source, autoSend: autoSend || e.shiftKey }
    });
    window.dispatchEvent(event);
  };

  const handleShowInitial = () => {
    if (initialQuestions.length === 0 || isGeneratingInitialQuestions) return;
    setShowInitialQuestions(true);
  };

  const handleRegenerate = async () => {
    if (!image || isStreaming || isGeneratingInitialQuestions) return;

    const now = Date.now();
    if (now - lastRegenerateRef.current < COOLDOWN_MS) return;
    lastRegenerateRef.current = now;

    setShowInitialQuestions(true);
    setIsGeneratingInitialQuestions(true);

    try {
      const questions = await generateInitialQuestions(image);
      setInitialQuestions(questions); // auto-sets showInitialQuestions: true
    } catch {
      toast.error('질문 재생성에 실패했습니다. 기존 질문을 유지합니다.');
    } finally {
      setIsGeneratingInitialQuestions(false);
    }
  };

  if (!image) return null;

  // Prompt priority:
  // 1. followUpQuestions exist && not showing initial → show follow-up questions
  // 2. showInitialQuestions && initialQuestions exist → show initial questions
  // 3. default prompts
  const isLoading = isGeneratingInitialQuestions
    ? true
    : (isGeneratingFollowUp && followUpQuestions.length === 0);

  let promptsToShow: string[] = [];
  let isInitial = false;

  if (followUpQuestions.length > 0 && !showInitialQuestions) {
    promptsToShow = followUpQuestions;
  } else if (showInitialQuestions && initialQuestions.length > 0) {
    promptsToShow = initialQuestions;
    isInitial = true;
  } else {
    promptsToShow = DEFAULT_PROMPTS;
  }

  // Helper actions — always visible whenever initial questions have been generated
  const canShowInitialActions = initialQuestions.length > 0 && !isGeneratingInitialQuestions;

  return (
    <div className="w-full mb-1">
      {/* Chips / skeleton */}
      <div className="flex flex-wrap gap-2 mb-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[32px] w-28 bg-[#E6E9F0] animate-pulse rounded-[6px]" />
          ))
        ) : (
          promptsToShow.map((prompt, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                const source = isInitial ? 'initial' : followUpQuestions.length > 0 && !showInitialQuestions ? 'followup' : 'default';
                handlePromptClick(e, prompt, source, isInitial);
              }}
              disabled={isStreaming}
              className="text-[13px] font-[600] bg-[#E6E9F0] text-[#2E394A] hover:bg-[#D0DAE4] px-3 py-[6px] rounded-[6px] transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))
        )}
      </div>

      {/* Hint text + action buttons row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-[#8996A4]">
          {isLoading
            ? '질문 다시 생성 중...'
            : isInitial
              ? '클릭하면 바로 전송됩니다'
              : 'Shift+클릭으로 바로 전송'}
        </p>

        {canShowInitialActions && (
          <div className="flex items-center gap-3 shrink-0">
            {!showInitialQuestions && (
              <button
                onClick={handleShowInitial}
                disabled={isStreaming}
                className="flex items-center gap-1 text-[11px] text-[#8996A4] hover:text-[#2E394A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <ChevronUp className="w-3 h-3" />
                초기 질문 다시 보기
              </button>
            )}

            <button
              onClick={handleRegenerate}
              disabled={isStreaming || isGeneratingInitialQuestions}
              className="flex items-center gap-1 text-[11px] text-[#8996A4] hover:text-[#2E394A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              다른 질문 추천받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
