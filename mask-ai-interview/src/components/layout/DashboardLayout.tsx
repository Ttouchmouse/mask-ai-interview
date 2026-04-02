import { ImageUpload } from '../upload/ImageUpload.tsx';
import { FilterChips } from '../persona/FilterChips.tsx';
import { ChatPanel } from '../chat/ChatPanel.tsx';
import maskLogo from '../../assets/mask-logo.png';

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-[var(--color-surface-bg)] text-[var(--color-text-main)] overflow-hidden font-sans">

      {/* Left Sidebar - 400px fixed */}
      <div className="w-[400px] flex-shrink-0 h-full flex flex-col bg-white border-r border-[var(--color-surface-border)]">

        {/* Sidebar Top - Logo + Info + Dropdowns */}
        <div className="flex-shrink-0 px-6 pt-6 pb-5 bg-white z-20">
          {/* Logo row */}
          <div className="flex items-center gap-2 mb-4">
            <img src={maskLogo} alt="MASK" className="h-[30px] w-auto" />
            <span className="px-2 py-1 rounded-[4px] bg-[#EFF2F6] text-[12px] text-[#8996A4]">GPT-4o</span>
          </div>

          {/* Description */}
          <p className="text-[14px] font-[500] text-[#8996A4] leading-[20px] mb-4">
            마스크는 테스트 화면을 업로드하여 가상의 사용자 인터뷰를 진행할 수 있는 AI 서비스입니다.
          </p>

          {/* Dropdowns */}
          <FilterChips />
        </div>

        {/* Sidebar Bottom - Image Upload */}
        <div className="flex-1 min-h-0 border-t border-[var(--color-surface-border)] flex flex-col">
          <ImageUpload />
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 h-full flex flex-col relative bg-[var(--color-surface-bg)]">
        <ChatPanel />
      </div>

    </div>
  );
}
