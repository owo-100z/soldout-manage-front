// 상위 컴포넌트로부터 전달받을 Props 타입 정의
interface TimeSelectBoxProps {
  value?: string;
  onChange: (value: string) => void;
  options: TypeOption[];
  label?: string;
}
export type TypeOption = {
    label: string,
    value: string,
}

export default function TimeSelectBox({ value, onChange, options, label = '시간 선택' }: TimeSelectBoxProps) {
  return (
    <div className="relative w-full">
      
      {/* 1. 디자인용 가짜 버튼 영역 (부모에게 받은 value를 보여줌) */}
      <div className="
        w-full flex items-center justify-between 
        px-4 py-3 
        bg-[#F3F4F6] text-[#222222] font-medium text-base
        border border-transparent rounded-xl 
        pointer-events-none transition-colors
      ">
        <span>
          {value
            ? options.find(opt => opt.value === value)?.label || options[0].label
            : label}
        </span>
        
        {/* 화살표 아이콘 */}
        <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 2. 실제 작동하는 투명 select 태그 (변경 시 부모의 onChange를 실행) */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)} // 🌟 여기서 부모에게 값 전달!
        className="
          absolute inset-0 w-full h-full 
          opacity-0 cursor-pointer 
          appearance-none
        "
      >
        <option value="" disabled hidden>{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
    </div>
  );
}