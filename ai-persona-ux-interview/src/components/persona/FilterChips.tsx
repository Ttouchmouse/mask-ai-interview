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
    <div className="flex flex-wrap gap-2 mt-4" ref={dropdownRef}>
      
      {/* Region Chip */}
      <div className="relative">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'region' ? null : 'region')}
          className="flex items-center gap-1 bg-white border border-[#E2E4E8] rounded-[20px] px-3 py-1.5 text-[13px] text-[#1A1A1A] cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {getRegionLabel()} <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
        {activeDropdown === 'region' && (
          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#E2E4E8] rounded-xl shadow-lg z-50 overflow-hidden text-[13px]">
            {[
              { label: '북미', value: '북미|영어' },
              { label: '한국', value: '한국|한국어' },
              { label: '일본', value: '일본|일본어' },
              { label: '유럽', value: '유럽|영어' }
            ].map(opt => (
              <button 
                key={opt.value}
                onClick={() => handleSelect('region_language', opt.value)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Age Group Chip */}
      <div className="relative">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'age' ? null : 'age')}
          className="flex items-center gap-1 bg-white border border-[#E2E4E8] rounded-[20px] px-3 py-1.5 text-[13px] text-[#1A1A1A] cursor-pointer hover:bg-gray-50 transition-colors"
        >
          연령대 · {getAgeGroupLabel()} <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
        {activeDropdown === 'age' && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#E2E4E8] rounded-xl shadow-lg z-50 overflow-hidden text-[13px]">
            {[
              { label: '10대 / 20대', value: 'teens / 20s' },
              { label: '30대 / 40대', value: '30s / 40s' },
              { label: '50대 이상', value: '50+' }
            ].map(opt => (
              <button 
                key={opt.value}
                onClick={() => handleSelect('ageGroup', opt.value)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Type Chip */}
      <div className="relative">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
          className="flex items-center gap-1 bg-white border border-[#E2E4E8] rounded-[20px] px-3 py-1.5 text-[13px] text-[#1A1A1A] cursor-pointer hover:bg-gray-50 transition-colors"
        >
          상태 · {getUserTypeLabel()} <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
        {activeDropdown === 'type' && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#E2E4E8] rounded-xl shadow-lg z-50 overflow-hidden text-[13px]">
            {[
              { label: '신규 사용자', value: 'new user' },
              { label: '기존 사용자', value: 'existing user' },
              { label: '유료 사용자', value: 'paying user' },
              { label: 'VIP 사용자', value: 'VIP user' }
            ].map(opt => (
              <button 
                key={opt.value}
                onClick={() => handleSelect('userType', opt.value)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
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
