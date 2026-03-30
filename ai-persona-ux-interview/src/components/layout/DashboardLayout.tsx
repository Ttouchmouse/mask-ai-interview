import { ImageUpload } from '../upload/ImageUpload.tsx';
import { FilterChips } from '../persona/FilterChips.tsx';
import { ChatPanel } from '../chat/ChatPanel.tsx';

export function DashboardLayout() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[var(--color-surface-bg)] text-[var(--color-text-main)] overflow-hidden font-sans">
      
      {/* Left Panel - Flat White Background with Vertical Line */}
      <div className="w-full md:w-[380px] flex-shrink-0 h-full flex flex-col bg-white border-r border-[var(--color-surface-border)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 bg-white z-20">
          <h1 className="text-[16px] font-bold text-[var(--color-text-main)]">
            AI 페르소나 UX 인터뷰
          </h1>
          <p className="text-[13px] font-[400] text-[var(--color-text-sub)] mt-1">
            목업을 업로드하고 사용자 관점에서 인터뷰를 진행하세요.
          </p>
          <FilterChips />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-6 flex flex-col">
          <ImageUpload />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full flex flex-col relative bg-[var(--color-surface-bg)]">
        <ChatPanel />
      </div>

    </div>
  );
}
