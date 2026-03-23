import { ImageUpload } from '../upload/ImageUpload.tsx';
import { PersonaControls } from '../persona/PersonaControls.tsx';
import { ChatPanel } from '../chat/ChatPanel.tsx';

export function DashboardLayout() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[var(--color-surface-bg)] text-[var(--color-text-main)] overflow-hidden font-sans">
      
      {/* Left Panel - Flat White Background with Vertical Line */}
      <div className="w-full md:w-[380px] flex-shrink-0 h-full flex flex-col bg-white border-r border-[var(--color-surface-border)] overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-[var(--color-surface-border)] bg-white sticky top-0 z-20">
          <h1 className="text-[16px] font-[500] text-[var(--color-text-main)] uppercase tracking-wide">
            AI 페르소나 UX 인터뷰
          </h1>
          <p className="text-[13px] font-[400] text-[var(--color-text-sub)] mt-2 leading-relaxed">
            목업을 업로드하고 사용자 관점에서 인터뷰를 진행하세요.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-10">
          
          <section className="flex flex-col gap-4">
            <div className="text-[13px] font-[500] text-[var(--color-text-main)] uppercase tracking-wider">UI 목업</div>
            <ImageUpload />
          </section>

          <div className="h-px bg-[var(--color-surface-border)] w-full hidden md:block"></div>

          <section className="flex flex-col gap-4">
            <div className="text-[13px] font-[500] text-[var(--color-text-main)] uppercase tracking-wider">타겟 페르소나</div>
            <PersonaControls />
          </section>

        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full flex flex-col relative bg-[var(--color-surface-bg)]">
        <ChatPanel />
      </div>

    </div>
  );
}
