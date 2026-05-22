"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TeamSpace, TripEvent } from "../types";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const KO_MONTH_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
});

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface Props {
  space: TeamSpace;
}

export function TravelCalendar({ space }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<TripEvent | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel = KO_MONTH_FORMATTER.format(new Date(viewYear, viewMonth));

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    return space.events.filter((e) => e.startDate <= dateStr && e.endDate >= dateStr);
  };

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const monthEvents = space.events
    .filter((e) => e.startDate <= `${monthPrefix}-31` && e.endDate >= `${monthPrefix}-01`)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      {/* 상단 바 */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7 py-5">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">여행 캘린더</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {space.emoji} {space.name}
          </p>
        </div>
        {/* 멤버 아바타 */}
        <div className="flex items-center gap-1">
          {space.members.map((m, i) => (
            <div
              key={m.id}
              title={m.username}
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white",
                i !== 0 && "-ml-1.5",
              )}
              style={{ background: m.avatarColor }}
            >
              {m.username.slice(0, 1)}
            </div>
          ))}
          <span className="ml-1.5 text-xs text-slate-400">{space.members.length}명</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 캘린더 패널 */}
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          {/* 월 네비게이션 */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={goToPrev}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-0 text-xl text-slate-500"
            >
              ‹
            </button>
            <span className="min-w-[120px] text-center text-base font-bold text-slate-900">
              {monthLabel}
            </span>
            <button
              onClick={goToNext}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-0 text-xl text-slate-500"
            >
              ›
            </button>
          </div>

          {/* 캘린더 그리드 */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "border-b border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold",
                    i === 0 && "text-red-500",
                    i === 6 && "text-brand-primary",
                    i !== 0 && i !== 6 && "text-slate-500",
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 셀 */}
            <div className="grid grid-cols-7">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="box-border min-h-[88px] border-b border-r border-slate-100 p-1.5" />
              ))}
              {days.map((day) => {
                const events = getEventsForDay(day);
                const colIndex = (firstDay + day - 1) % 7;
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();

                return (
                  <div
                    key={day}
                    className={cn(
                      "box-border min-h-[88px] border-b border-r border-slate-100 p-1.5",
                      isToday && "bg-blue-50",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px]",
                        isToday && "bg-brand-primary font-bold text-white",
                        !isToday && colIndex === 0 && "text-red-500",
                        !isToday && colIndex === 6 && "text-brand-primary",
                        !isToday && colIndex !== 0 && colIndex !== 6 && "text-slate-800",
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {events.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelected(selected?.id === e.id ? null : e)}
                          className={cn(
                            "w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded px-1.5 py-0.5 text-left text-[10px] font-semibold",
                            selected?.id === e.id ? "ring-1" : "",
                          )}
                          style={{
                            background: e.color + "22",
                            color: e.color,
                          }}
                          title={e.title}
                        >
                          {e.title}
                        </button>
                      ))}
                      {events.length > 2 && (
                        <span className="pl-1 text-[10px] text-slate-400">
                          +{events.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 일정 목록 패널 */}
        <div className="w-[260px] min-w-[260px] flex-shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5">
          {selected ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="h-1" style={{ background: selected.color }} />
              <div className="relative p-3.5">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-2.5 top-2.5 cursor-pointer border-none bg-transparent p-1 text-sm text-slate-400"
                >
                  ✕
                </button>
                <div
                  className="mb-2 h-2 w-2 rounded-full"
                  style={{ background: selected.color }}
                />
                <h3 className="mb-2 text-[15px] font-bold leading-snug text-slate-900">
                  {selected.title}
                </h3>
                <p className="mb-1 text-xs text-slate-500">📍 {selected.location}</p>
                <p className="mb-1 text-xs text-slate-500">
                  🗓{" "}
                  {selected.startDate === selected.endDate
                    ? selected.startDate
                    : `${selected.startDate} ~ ${selected.endDate}`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-slate-500">
                {monthLabel} 일정{" "}
                <span className="rounded-full bg-slate-200 px-1.5 py-px text-[11px] font-semibold text-slate-500">
                  {monthEvents.length}
                </span>
              </p>
              {monthEvents.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-slate-400">
                  <span className="mb-2 block text-[32px]">🗓</span>
                  이번 달 일정이 없습니다
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {monthEvents.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="flex w-full cursor-pointer items-stretch gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                    >
                      <div
                        className="w-0.5 flex-shrink-0 self-stretch rounded-sm"
                        style={{ background: e.color }}
                      />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-slate-900">
                          {e.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          📍 {e.location} &middot;{" "}
                          {e.startDate === e.endDate
                            ? e.startDate.slice(5).replace("-", "/")
                            : `${e.startDate.slice(5).replace("-", "/")} ~ ${e.endDate.slice(5).replace("-", "/")}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
