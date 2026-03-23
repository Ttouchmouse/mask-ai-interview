import { useStore } from '../../store/useStore.ts';

export function PersonaControls() {
  const { persona, setPersona, messages, clearMessages } = useStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (messages.length > 0) {
      const confirm = window.confirm(
        "페르소나를 변경하면 현재 대화가 삭제됩니다. 계속하시겠습니까?"
      );
      if (!confirm) return;
      clearMessages();
    }
    
    setPersona({ [name]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col gap-1">
        <label htmlFor="region" className="text-[12px] font-[500] text-[var(--color-text-sub)]">
          지역 / 언어
        </label>
        <select 
          id="region"
          name="region" 
          value={persona.region} 
          onChange={handleChange}
          className="w-full bg-white border-0 border-b border-[var(--color-surface-border)] rounded-none px-1 py-2.5 text-[14px] font-[400] text-[var(--color-text-main)] focus:ring-0 focus:border-[var(--color-primary)] outline-none transition-colors cursor-pointer"
        >
          <option value="North America">북미 (영어)</option>
          <option value="Korea">한국 (한국어)</option>
          <option value="Japan">일본 (일본어)</option>
          <option value="Europe">유럽 (영어)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ageGroup" className="text-[12px] font-[500] text-[var(--color-text-sub)]">
          연령대
        </label>
        <select 
          id="ageGroup"
          name="ageGroup" 
          value={persona.ageGroup} 
          onChange={handleChange}
          className="w-full bg-white border-0 border-b border-[var(--color-surface-border)] rounded-none px-1 py-2.5 text-[14px] font-[400] text-[var(--color-text-main)] focus:ring-0 focus:border-[var(--color-primary)] outline-none transition-colors cursor-pointer"
        >
          <option value="teens / 20s">10대 / 20대</option>
          <option value="30s / 40s">30대 / 40대</option>
          <option value="50+">50대 이상</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="userType" className="text-[12px] font-[500] text-[var(--color-text-sub)]">
          사용자 유형
        </label>
        <select 
          id="userType"
          name="userType" 
          value={persona.userType} 
          onChange={handleChange}
          className="w-full bg-white border-0 border-b border-[var(--color-surface-border)] rounded-none px-1 py-2.5 text-[14px] font-[400] text-[var(--color-text-main)] focus:ring-0 focus:border-[var(--color-primary)] outline-none transition-colors cursor-pointer"
        >
          <option value="new user">신규 사용자</option>
          <option value="existing user">기존 사용자</option>
          <option value="paying user">유료 사용자</option>
          <option value="VIP user">VIP 사용자</option>
        </select>
      </div>
      
    </div>
  );
}
