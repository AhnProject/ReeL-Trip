"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CalendarEvent } from "../types";
import { TEST_CALENDAR_EVENTS } from "../mock";
import { Toast, useToast } from "@/components/Toast";

/* ─────────────────────────── 상수 ─────────────────────────── */

const NAV_ITEMS = [
  { key: "dashboard",  icon: "🔵", label: "대시보드",   hasArrow: false, active: false },
  { key: "travel",     icon: "✈️", label: "여행계획",   hasArrow: false, active: false },
  { key: "calendar",   icon: "📅", label: "캘린더",     hasArrow: true,  active: true  },
  { key: "checklist",  icon: "☑️", label: "체크리스트", hasArrow: true,  active: false },
  { key: "transport",  icon: "🚌", label: "교통",       hasArrow: false, active: false },
];

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const WEEK_DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* ─────────────────────────── 유틸 ─────────────────────────── */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatKoDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${month}월 ${day}일, ${dow}요일`;
}

/* ─────────────────────────── 컴포넌트 ─────────────────────────── */

export function CalendarScreen() {
  const router = useRouter();
  const { visible, showToast } = useToast();

  /* ── auth ── */
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName  = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(storedName ?? "");
  }, [router]);

  /* ── 캘린더 상태 ── */
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  /* ── 이벤트 데이터 (Test) ── */
  // [Test] API 미구현 — 추후 apiRequest<CalendarEvent[]>("/api/calendar/events", ..., token) 으로 교체
  const [events] = useState<CalendarEvent[]>(TEST_CALENDAR_EVENTS);

  /* ── 파생 데이터 ── */
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel  = `${viewYear}년 ${viewMonth + 1}월`;

  const eventsForDate = (dateStr: string) =>
    events.filter((e) => e.date === dateStr);

  const selectedEvents = eventsForDate(selectedDate);

  /* ── 주간 뷰용 날짜 배열 ── */
  const getWeekDates = () => {
    const selDate = new Date(selectedDate);
    const dayOfWeek = selDate.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(selDate);
      d.setDate(selDate.getDate() - dayOfWeek + i);
      return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    });
  };

  /* ── 네비게이션 ── */
  const goToPrev = () => {
    if (viewMode === "month") {
      if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
      else setViewMonth((m) => m - 1);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(toDateStr(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  };

  const goToNext = () => {
    if (viewMode === "month") {
      if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
      else setViewMonth((m) => m + 1);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(toDateStr(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  };

  const handleNav = (key: string) => {
    if (key === "dashboard") router.push("/dashboard/main");
    if (key === "travel")    router.push("/dashboard/travel");
    if (key === "checklist" || key === "transport") showToast();
  };

  /* ── 인증 대기 ── */
  if (!token) return null;

  /* ── username에서 성씨 추출 (API에서 받은 값) ── */
  const familyName = username.length > 0 ? username[0] : "?";
  // [Test] plan 정보는 API 미구현 — 추후 /api/user/profile 에서 수신 예정
  const planLabel = "Pro 플랜"; // [Test]

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#F5F6FA", fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* ══════════════ GNB ══════════════ */}
      <header
        className="flex h-[60px] flex-shrink-0 items-center justify-between px-6"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EAEDF3" }}
      >
        {/* 좌측 로고 */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{ background: "#4A6CF7" }}
          >
            RT
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight text-slate-900">ReelTrip</div>
            {/* API: username은 localStorage에서 수신 */}
            <div className="text-[11px] leading-tight text-slate-400">
              {username}님, 환영합니다
            </div>
          </div>
        </div>

        {/* 중앙 검색창 */}
        <div
          className="flex h-9 items-center gap-2 rounded-2xl px-4"
          style={{ background: "#F5F6FA", border: "1px solid #E2E6F0" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="장소 또는 이름 검색"
            className="w-[220px] border-none bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 우측 버튼 */}
        <button
          onClick={showToast}
          className="h-9 cursor-pointer rounded-2xl border-none px-5 text-[13px] font-semibold text-white"
          style={{ background: "#4A6CF7" }}
        >
          시작하기
        </button>
      </header>

      {/* ══════════════ 본문 3단 ══════════════ */}
      <div className="flex min-h-0 flex-1">

        {/* ── 좌측 사이드바 ── */}
        <aside
          className="flex h-full w-[200px] flex-shrink-0 flex-col"
          style={{ background: "#FFFFFF", borderRight: "1px solid #EAEDF3" }}
        >
          <nav className="flex flex-1 flex-col gap-1 px-3 pt-5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border-none px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={
                  item.active
                    ? { background: "#EEF2FF", color: "#4A6CF7", fontWeight: 600 }
                    : { background: "transparent", color: "#6B7280", fontWeight: 400 }
                }
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </span>
                {item.hasArrow && (
                  <span
                    className="text-[10px]"
                    style={{ color: item.active ? "#4A6CF7" : "#9CA3AF" }}
                  >
                    ▼
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* 하단 프로필 */}
          <div
            className="flex items-center gap-2.5 px-4 py-4"
            style={{ borderTop: "1px solid #EAEDF3" }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: "#4A6CF7" }}
            >
              {/* API: username 첫 글자(성씨) 표시 */}
              {familyName}
            </div>
            <div className="min-w-0">
              {/* API: username */}
              <div className="truncate text-[13px] font-semibold text-slate-800">{username}</div>
              {/* [Test] plan 정보 — API 미구현 */}
              <div className="text-[11px] text-slate-400">{planLabel}</div>
            </div>
          </div>
        </aside>

        {/* ── 중앙 캘린더 콘텐츠 ── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-8 py-6">

          {/* 월 네비게이션 */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrev}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-500"
                style={{ borderRadius: "8px" }}
              >
                ‹
              </button>
              <span className="text-[18px] font-bold text-slate-900">{monthLabel}</span>
              <button
                onClick={goToNext}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-500"
                style={{ borderRadius: "8px" }}
              >
                ›
              </button>
            </div>

            {/* 월간/주간 토글 */}
            <div
              className="flex items-center gap-0.5 rounded-2xl p-1"
              style={{ background: "#FFFFFF", border: "1px solid #E2E6F0" }}
            >
              {(["month", "week"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="cursor-pointer rounded-xl border-none px-4 py-1.5 text-[12px] font-semibold transition-colors"
                  style={
                    viewMode === mode
                      ? { background: "#4A6CF7", color: "#FFFFFF" }
                      : { background: "transparent", color: "#6B7280" }
                  }
                >
                  {mode === "month" ? "월간 보기" : "주간 보기"}
                </button>
              ))}
            </div>
          </div>

          {/* ── 월간 캘린더 그리드 ── */}
          {viewMode === "month" && (
            <div
              className="overflow-hidden rounded-xl"
              style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
            >
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DAY_LABELS.map((d, i) => (
                  <div
                    key={d}
                    className="py-3 text-center text-[12px] font-semibold"
                    style={{
                      color: i === 0 ? "#EF4444" : i === 6 ? "#4A6CF7" : "#94A3B8",
                      background: "#FAFBFF",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 셀 */}
              <div className="grid grid-cols-7">
                {/* 빈 칸 */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`blank-${i}`} className="min-h-[90px] border-b border-r border-slate-100 p-2" />
                ))}

                {/* 날짜 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const colIdx   = (firstDay + day - 1) % 7;
                  const dateStr  = toDateStr(viewYear, viewMonth, day);
                  const dayEvents = eventsForDate(dateStr);
                  const isToday  =
                    day === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className="min-h-[90px] cursor-pointer border-b border-r border-slate-100 p-2 transition-colors"
                      style={
                        isSelected && !isToday
                          ? { background: "#EEF2FF" }
                          : {}
                      }
                    >
                      {/* 날짜 숫자 */}
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px]"
                        style={
                          isToday
                            ? { background: "#4A6CF7", color: "#FFFFFF", fontWeight: 700 }
                            : colIdx === 0
                            ? { color: "#EF4444" }
                            : colIdx === 6
                            ? { color: "#4A6CF7" }
                            : { color: "#334155" }
                        }
                      >
                        {day}
                      </span>

                      {/* 이벤트 바 */}
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div
                            key={evt.id}
                            className="w-full overflow-hidden text-ellipsis whitespace-nowrap rounded px-1.5 py-px text-[10px] font-semibold"
                            style={{
                              background: evt.color + "22",
                              color: evt.color,
                            }}
                            title={evt.title}
                          >
                            {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="pl-1 text-[10px] text-slate-400">
                            +{dayEvents.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 주간 캘린더 뷰 ── */}
          {viewMode === "week" && (
            <div
              className="overflow-hidden rounded-xl"
              style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
            >
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {getWeekDates().map((dateStr, i) => {
                  const d       = new Date(dateStr);
                  const dayNum  = d.getDate();
                  const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSel   = dateStr === selectedDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className="flex cursor-pointer flex-col items-center py-4 transition-colors"
                      style={
                        isSel && !isToday ? { background: "#EEF2FF" } : {}
                      }
                    >
                      <span
                        className="mb-1 text-[11px] font-semibold"
                        style={{
                          color: i === 0 ? "#EF4444" : i === 6 ? "#4A6CF7" : "#94A3B8",
                        }}
                      >
                        {WEEK_DAY_LABELS[i]}
                      </span>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold"
                        style={
                          isToday
                            ? { background: "#4A6CF7", color: "#FFFFFF" }
                            : { color: "#334155" }
                        }
                      >
                        {dayNum}
                      </span>
                      {/* 이벤트 dot */}
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {eventsForDate(dateStr).slice(0, 3).map((evt) => (
                          <span
                            key={evt.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: evt.color }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 주간 이벤트 리스트 */}
              <div className="p-5">
                {getWeekDates().map((dateStr) => {
                  const dayEvts = eventsForDate(dateStr);
                  if (dayEvts.length === 0) return null;
                  const d = new Date(dateStr);
                  return (
                    <div key={dateStr} className="mb-4">
                      <div className="mb-2 text-[12px] font-bold text-slate-500">
                        {d.getMonth() + 1}월 {d.getDate()}일
                      </div>
                      <div className="flex flex-col gap-2">
                        {dayEvts.map((evt) => (
                          <div
                            key={evt.id}
                            className="flex items-center gap-3 rounded-xl px-4 py-3"
                            style={{
                              background: evt.color + "11",
                              borderLeft: `3px solid ${evt.color}`,
                            }}
                          >
                            <div className="flex-1">
                              <div className="text-[13px] font-semibold text-slate-800">{evt.title}</div>
                              {(evt.time || evt.price) && (
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                  {evt.time && `🕐 ${evt.time}`}
                                  {evt.time && evt.price && " · "}
                                  {evt.price && evt.price}
                                </div>
                              )}
                            </div>
                            {evt.status === "confirmed" && (
                              <span
                                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                                style={{ background: "#EEF2FF", color: "#4A6CF7" }}
                              >
                                확정
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {getWeekDates().every((d) => eventsForDate(d).length === 0) && (
                  <div className="py-10 text-center text-[13px] text-slate-400">
                    <span className="mb-2 block text-[32px]">📅</span>
                    이번 주 일정이 없습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── 우측 패널 ── */}
        <aside
          className="flex w-[300px] flex-shrink-0 flex-col overflow-y-auto px-5 py-6"
          style={{ background: "#FFFFFF", borderLeft: "1px solid #EAEDF3" }}
        >
          {/* 날짜 타이틀 */}
          <div className="mb-4">
            <div className="text-[16px] font-bold text-slate-900">
              {formatKoDate(selectedDate)}
            </div>
            <div className="mt-0.5 text-[12px] text-slate-400">
              {/* API: username */}
              {username}님의 일정
            </div>
          </div>

          {/* 일정 카드 리스트 */}
          <div className="flex flex-1 flex-col gap-3">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="mb-2 text-[36px]">📅</span>
                <div className="text-[13px] text-slate-400">선택한 날짜에 일정이 없습니다</div>
                <div className="mt-1 text-[11px] text-slate-300">
                  아래 버튼으로 일정을 추가해보세요
                </div>
              </div>
            ) : (
              selectedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5"
                  style={{
                    background: "#FAFBFF",
                    border: "1px solid #EAEDF3",
                    borderRadius: "12px",
                    borderLeft: `4px solid ${evt.color}`,
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-slate-800">
                      {evt.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-400">
                      {evt.time && `🕐 ${evt.time}`}
                      {evt.time && evt.price && " · "}
                      {/* [Test] price 데이터 — API 미구현 */}
                      {evt.price && evt.price}
                    </div>
                    {evt.location && (
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        📍 {evt.location}
                      </div>
                    )}
                  </div>
                  {evt.status === "confirmed" ? (
                    <button
                      onClick={showToast}
                      className="ml-3 flex-shrink-0 cursor-pointer rounded-2xl border-none px-3 py-1.5 text-[12px] font-semibold text-white"
                      style={{ background: "#4A6CF7", borderRadius: "24px" }}
                    >
                      확정
                    </button>
                  ) : (
                    <button
                      onClick={showToast}
                      className="ml-3 flex-shrink-0 cursor-pointer rounded-2xl border px-3 py-1.5 text-[12px] font-semibold"
                      style={{
                        background: "transparent",
                        borderColor: "#E2E6F0",
                        color: "#94A3B8",
                        borderRadius: "24px",
                      }}
                    >
                      대기
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* + 일정 추가 버튼 */}
          <button
            onClick={showToast}
            className="mt-4 w-full cursor-pointer rounded-2xl border-none py-3 text-[14px] font-semibold text-white"
            style={{ background: "#4A6CF7", borderRadius: "24px" }}
          >
            + 일정 추가
          </button>
        </aside>

      </div>

      <Toast visible={visible} />
    </div>
  );
}
