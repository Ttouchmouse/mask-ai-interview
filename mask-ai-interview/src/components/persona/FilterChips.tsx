import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore.ts';
import { ChevronDown } from 'lucide-react';

export function FilterChips() {
  const { persona, setPersona, messages, clearChat } = useStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string, value: string) => {
    if (messages.length > 0) {
      const confirm = window.confirm(
        "페르소나를 변경하면 현재 대화가 삭제됩니다. 계속하시겠습니까?"
      );
      if (!confirm) {
        setActiveDropdown(null);
        return;
      }
      clearChat();
    }
    
    if (name === "region_language") {
      const [region, language] = value.split("|");
      setPersona({ region, language });
    } else {
      setPersona({ [name]: value });
    }
    setActiveDropdown(null);
  };

  const getRegionLabel = () => {
    const map: Record<string, string> = {
      '북미': '🇺🇸 북미',
      '한국': '🇰🇷 한국',
      '일본': '🇯🇵 일본',
      '유럽': '🌍 유럽'
    };
    return map[persona.region] || persona.region;
  };

  const getAgeGroupLabel = () => {
    const map: Record<string, string> = {
      'teens / 20s': '10대 / 20대',
      '30s / 40s': '30대 / 40대',
      '50+': '50대 이상'
    };
    return map[persona.ageGroup] || persona.ageGroup;
  };

  const getUserTypeLabel = () => {
    const map: Record<string, string> = {
      'new user': '신규 사용자',
      'existing user': '기존 사용자',
      'paying user': '유료 사용자',
      'VIP user': 'VIP 사용자'
    };
    return map[persona.userType] || persona.userType;
  };

  return (
    <div className="flex flex-wrap gap-2" ref={dropdownRef}>

      {/* Region Dropdown */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'region' ? null : 'region')}
          className="flex items-center gap-2 bg-white border border-[#D0D6DD] rounded-[8px] px-3 py-2 text-[14px] text-[#2E394A] cursor-pointer hover:bg-[#F6F7F9] transition-colors whitespace-nowrap"
        >
          <span>국적 · {getRegionLabel()}</span>
          <ChevronDown className="w-4 h-4 text-[#8996A4] flex-shrink-0" />
        </button>
        {activeDropdown === 'region' && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D0D6DD] rounded-[8px] shadow-lg z-50 overflow-hidden text-[14px]">
            {[
              { label: '북미', value: '북미|영어' },
              { label: '한국', value: '한국|한국어' },
              { label: '일본', value: '일본|일본어' },
              { label: '유럽', value: '유럽|영어' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect('region_language', opt.value)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F6F7F9] transition-colors text-[#2E394A]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Age Group Dropdown */}
      <div className="relative flex-1 min-w-0">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'age' ? null : 'age')}
          className="w-full flex items-center justify-between gap-2 bg-white border border-[#D0D6DD] rounded-[8px] px-3 py-2 text-[14px] text-[#2E394A] cursor-pointer hover:bg-[#F6F7F9] transition-colors"
        >
          <span>연령대 · {getAgeGroupLabel()}</span>
          <ChevronDown className="w-4 h-4 text-[#8996A4] flex-shrink-0" />
        </button>
        {activeDropdown === 'age' && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D0D6DD] rounded-[8px] shadow-lg z-50 overflow-hidden text-[14px]">
            {[
              { label: '10대 / 20대', value: 'teens / 20s' },
              { label: '30대 / 40대', value: '30s / 40s' },
              { label: '50대 이상', value: '50+' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect('ageGroup', opt.value)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F6F7F9] transition-colors text-[#2E394A]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Type Dropdown */}
      <div className="relative w-full">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
          className="w-full flex items-center justify-between gap-2 bg-white border border-[#D0D6DD] rounded-[8px] px-3 py-2 text-[14px] text-[#2E394A] cursor-pointer hover:bg-[#F6F7F9] transition-colors"
        >
          <span>상태 · {getUserTypeLabel()}</span>
          <ChevronDown className="w-4 h-4 text-[#8996A4] flex-shrink-0" />
        </button>
        {activeDropdown === 'type' && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D0D6DD] rounded-[8px] shadow-lg z-50 overflow-hidden text-[14px]">
            {[
              { label: '신규 사용자', value: 'new user' },
              { label: '기존 사용자', value: 'existing user' },
              { label: '유료 사용자', value: 'paying user' },
              { label: 'VIP 사용자', value: 'VIP user' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect('userType', opt.value)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F6F7F9] transition-colors text-[#2E394A]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
