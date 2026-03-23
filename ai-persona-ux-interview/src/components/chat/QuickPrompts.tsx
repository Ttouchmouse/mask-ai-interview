import { useStore } from '../../store/useStore.ts';

const PROMPTS = [
  "이 버튼이 무슨 역할을 한다고 생각하시나요?",
  "여기서 다음으로 무엇을 하시겠습니까?",
  "이 화면에서 헷갈리는 부분이 있나요?",
  "여기서 계속 진행하시겠습니까?",
  "망설여지는 부분이 있나요?"
];

export function QuickPrompts() {
  const { image, isStreaming } = useStore();

  const handlePromptClick = (prompt: string) => {
    if (!image || isStreaming) return;
    const event = new CustomEvent('send-quick-prompt', { detail: prompt });
    window.dispatchEvent(event);
  };

  if (!image) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-1 w-full">
      {PROMPTS.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => handlePromptClick(prompt)}
          disabled={isStreaming}
          className="text-[13px] font-[400] bg-white hover:bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] px-4 py-2 rounded-none transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
