import { useStore } from '../../store/useStore.ts';

const DEFAULT_PROMPTS = [
  "이 버튼이 무슨 역할을 한다고 생각하시나요?",
  "여기서 다음으로 무엇을 하시겠습니까?",
  "이 화면에서 헷갈리는 부분이 있나요?",
  "여기서 계속 진행하시겠습니까?",
  "망설여지는 부분이 있나요?"
];

export function QuickPrompts() {
  const { image, isStreaming, followUpQuestions, isGeneratingFollowUp } = useStore();

  const handlePromptClick = (e: React.MouseEvent, prompt: string) => {
    if (!image || isStreaming) return;
    const event = new CustomEvent('quick-prompt-action', { 
      detail: { prompt, autoSend: e.shiftKey } 
    });
    window.dispatchEvent(event);
  };

  if (!image) return null;

  const promptsToShow = followUpQuestions.length > 0 ? followUpQuestions : DEFAULT_PROMPTS;

  return (
    <div className="w-full mb-2">
      <div className="flex flex-wrap gap-2 mb-1">
        {isGeneratingFollowUp ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[38px] w-32 bg-[var(--color-surface-border)] animate-pulse rounded-none"></div>
          ))
        ) : (
          promptsToShow.map((prompt, idx) => (
            <button
              key={idx}
              onClick={(e) => handlePromptClick(e, prompt)}
              disabled={isStreaming}
              className="text-[13px] font-[400] bg-white hover:bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] px-4 py-2 rounded-none transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
            >
              {prompt}
            </button>
          ))
        )}
      </div>
      <p className="text-[11px] text-[var(--color-text-muted)] ml-1">
        💡 칩을 클릭하면 입력창에 복사됩니다. Shift+클릭으로 바로 전송하세요.
      </p>
    </div>
  );
}
