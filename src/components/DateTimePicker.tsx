import { useState, useEffect, useRef } from "react";
import dayjs, { type Dayjs } from "dayjs";
import Select from '@/components/ui/select'

interface DateTimePickerProps {
  initialValue?: string;
  onChange: (value: Dayjs | null) => void;
  showTime?: boolean;
}

// 한글 월 이름
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function DateTimePicker({ initialValue, onChange, showTime = true }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isOpen, setIsOpen] = useState(false);

  const [hour, setHour] = useState(11);
  const [minute, setMinute] = useState(0);
  
  const today = dayjs();
  const pickerRef = useRef<HTMLDivElement>(null);

  // mount 시 초기값 설정
  useEffect(() => {
    if (initialValue) {
      const d = dayjs(initialValue);
      setSelectedDate(d.startOf("day"));
      setSelectedTime(d.format("HH:mm"));
      setCurrentMonth(d.startOf("month"));
      setHour(11);
      setMinute(0);
    }
  }, [initialValue]);

  // 달력용 날짜 배열
  const getDaysInMonth = (month: Dayjs) => {
    const start = month.startOf("month");
    const end = month.endOf("month");
    const days: Dayjs[] = [];
    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      days.push(d);
    }
    return days;
  };

  // 값 변경 시 부모로 전달
  const setDateTime = () => {
    if (onChange && selectedDate) {
      let combined = selectedDate;

      if (showTime && selectedTime) {
        const [hh, mm] = [hour, minute];
        combined = selectedDate.hour(hh).minute(mm);
      }

      onChange(combined);
    }
  
    setIsOpen(false);
  };

  // 피커 열기/닫기
  const openDateTimePicker = () => {
    if (isOpen) {
      if (initialValue) {
        const d = dayjs(initialValue);
        setSelectedDate(d.startOf("day"));
        setSelectedTime(d.format("HH:mm"));
        setCurrentMonth(d.startOf("month"));
        if (onChange) {
          onChange(d);
        }
      } else {
        setSelectedDate(null);
        setSelectedTime('');
        setCurrentMonth(dayjs());
      }
    }

    setIsOpen(!isOpen);
  };

  const days = getDaysInMonth(currentMonth);

  // 시간 리스트 (30분 단위, 11시~23시)
  const times: string[] = [];
  for (let h = 11; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  const hours: string[] = [];
  for (let h = 11; h < 24; h++) {
    hours.push(`${String(h).padStart(2, "0")}`);
  }

  const minutes: string[] = [];
  for (let m = 0; m < 60; m += 30) {
    minutes.push(`${String(m).padStart(2, "0")}`);
  }

  const formatted =
    selectedDate && selectedTime
      ? `${selectedDate.format("MM월 DD일")} ${showTime ? selectedTime : ''} 까지`
      : "날짜와 시간을 선택하세요";

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button
        className="w-full px-3 py-2 rounded-lg border-2 border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 h-12"
        onClick={openDateTimePicker}
      >
        <span className="w-full text-start text-[5vw] text-zinc-700 md:text-3xl font-bold whitespace-nowrap">{formatted}</span>
        <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-zinc-200 shadow-lg rounded-2xl p-4">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <button
              className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-sm text-zinc-600"
              onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            >
              ◀
            </button>
            <div className="font-semibold text-base text-zinc-800">
              {currentMonth.year()}년 {MONTH_NAMES[currentMonth.month()]}
            </div>
            <button
              className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-sm text-zinc-600"
              onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            >
              ▶
            </button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-500 mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 text-center text-sm">
            {Array(days[0].day())
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

            {days.map((day) => {
              const isToday = day.isSame(today, "day");
              const isSelected = selectedDate && day.isSame(selectedDate, "day");
              return (
                <button
                  key={day.format("YYYY-MM-DD")}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 rounded-full text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-rose-500/50 text-white"
                      : isToday
                      ? "bg-zinc-300 text-zinc-800 font-semibold"
                      : "hover:bg-zinc-200"
                  }`}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>

          {/* 시간 선택 */}
          {showTime && (
            <div className="mt-4 grid grid-cols-2 gap-1">
              <Select
                value={String(hour)}
                onChange={(v) => setHour(Number(v))}
                options={hours.map(t => ({label: t, value: t}))}
                label="시간 선택"
              />
              <Select
                value={String(minute)}
                onChange={(v) => setMinute(Number(v))}
                options={minutes.map(t => ({label: t, value: t}))}
                label="분 선택"
              />
            </div>
          )}

          {/* 확인 버튼 */}
          <div className="mt-4 flex justify-end">
            <button
              className="btn w-full rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white"
              disabled={!selectedDate || (showTime && !selectedTime)}
              onClick={setDateTime}
            >
              선택 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}