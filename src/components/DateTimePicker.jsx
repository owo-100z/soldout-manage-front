import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

export default function DateTimePicker({ initialValue, onChange, showTime = true }) {
  const [selectedDate, setSelectedDate] = useState(null); // dayjs 객체
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isOpen, setIsOpen] = useState(false);

  const today = dayjs();

  // ✅ mount 시 초기값 설정
  useEffect(() => {
    if (initialValue) {
      const d = dayjs(initialValue);
      setSelectedDate(d.startOf("day"));
      setSelectedTime(d.format("HH:mm"));
      setCurrentMonth(d.startOf("month"));
    }
  }, [initialValue]);

  // ✅ 달력용 날짜 배열
  const getDaysInMonth = (month) => {
    const start = month.startOf("month");
    const end = month.endOf("month");
    const days = [];
    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      days.push(d);
    }
    return days;
  };

  // ✅ 값 변경 시 부모로 전달
  const setDateTime = () => {
    if (onChange && selectedDate) {
      let combined = selectedDate;
  
      if (showTime && selectedTime) {
        const [hh, mm] = selectedTime.split(":").map(Number);
        combined = selectedDate.hour(hh).minute(mm);
      }
  
      onChange(combined);
    }
  
    setIsOpen(false);
  };

  // 달력 input영역을 다시 클릭하면 값 초기화
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
  }

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.format("MMMM");

  // ✅ 시간 리스트 (30분 단위)
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  const formatted =
    selectedDate && selectedTime
      ? `${selectedDate.format("YYYY.MM.DD")} ${showTime ? selectedTime : ''}`
      : "날짜와 시간을 선택하세요";

  return (
    <div className="relative w-full mx-auto">
      <button
        className="btn bg-white border-gray w-full justify-between rounded-lg opacity-70"
        onClick={openDateTimePicker}
      >
        <span>{formatted}</span>
        <FaCalendarAlt />
      </button>

      {isOpen && (
        <div className="absolute mt-2 z-50 bg-base-100 border border-base-300 shadow-lg rounded-2xl p-4 w-full">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            >
              ◀
            </button>
            <div className="font-semibold">
              {currentMonth.format("YYYY년 MMMM")}
            </div>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            >
              ▶
            </button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 text-center text-sm font-semibold mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 text-center">
            {Array(days[0].day())
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} />
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
                      ? "bg-primary/50 text-white"
                      : isToday
                      ? "bg-base-300 text-primary/50 font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>

          {/* 시간 선택 */}
          {showTime && (
            <div className="mt-4">
                <div className="flex items-center mb-2 gap-2">
                <FaClock className="text-gray-500" />
                <span className="font-semibold text-sm">시간 선택</span>
                </div>
                <select
                className="select select-bordered w-full cursor-pointer"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                >
                <option value="">시간 선택</option>
                {times.map((t) => (
                    <option key={t} value={t}>
                    {t}
                    </option>
                ))}
                </select>
            </div>
          )}

          {/* 확인 버튼 */}
          <div className="mt-4 flex justify-end">
            <button
              className="btn w-full rounded-xl"
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