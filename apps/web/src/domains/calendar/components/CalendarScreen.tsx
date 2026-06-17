"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { CalendarEvent } from "../types";
import { Toast, useToast } from "@/components/Toast";
import { getProfile } from "@/domains/user/api";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { listEvents, updateEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";
import { CreateEventModal } from "@/domains/event/components/CreateEventModal";
import { Logo } from "@/components/Logo";

/* ─────────────────────────── 상수 ─────────────────────────── */


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

function rawToCalendarEvent(e: EventResponse): CalendarEvent {
  const dateOnly = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
  return {
    id: String(e.id),
    title: e.title,
    date: dateOnly,
    time: undefined,
    price: e.price ?? undefined,
    color: e.color,
    status: e.status as "confirmed" | "pending",
    location: e.location ?? undefined,
  };
}

/* ─────────────────────────── 컴포넌트 ─────────────────────────── */

export function CalendarScreen() {
  const router = useRouter();
  const { visible, showToast } = useToast();

  /* ── auth ── */
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [planLabel, setPlanLabel] = useState("...");

  /* ── 스페이스 ── */
  const [spaceId, setSpaceId] = useState<number | null>(null);

  /* ── 이벤트 데이터 (raw) ── */
  const [rawEvents, setRawEvents] = useState<EventResponse[]>([]);

  /* ── 모달 ── */
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName  = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(storedName ?? "");

    getProfile(storedToken).then((res) => {
      if (res.success && res.data) {
        setPlanLabel(res.data.plan === "FREE" ? "Free 플랜" : "Pro 플랜");
      }
    }).catch((err) => console.error("[CalendarScreen]", err));

    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setSpaceId(res.data[0].id);
      }
    }).catch((err) => console.error("[CalendarScreen]", err));
  }, [router]);

  /* ── 캘린더 상태 ── */
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  /* ── 월 변경 시 이벤트 로드 ── */
  useEffect(() => {
    if (!token || !spaceId) return;
    const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    listEvents(spaceId, monthStr, token).then((eventsRes) => {
      if (eventsRes.success && eventsRes.data) {
        setRawEvents(eventsRes.data);
      }
    }).catch((err) => console.error("[CalendarScreen]", err));
  }, [token, spaceId, viewYear, viewMonth]);

  /* ── raw → CalendarEvent 변환 ── */
  const events: CalendarEvent[] = rawEvents.map(rawToCalendarEvent);

  /* ── 상태 토글 ── */
  const handleToggleStatus = async (eventId: string) => {
    const raw = rawEvents.find((e) => String(e.id) === eventId);
    if (!raw || !token) return;
    const newStatus = raw.status === "confirmed" ? "pending" : "confirmed";
    setRawEvents((prev) =>
      prev.map((e) => (e.id === raw.id ? { ...e, status: newStatus } : e)),
    );
    await updateEvent(raw.id, {
      title: raw.title,
      description: raw.description ?? undefined,
      startDate: raw.startDate,
      endDate: raw.endDate,
      location: raw.location ?? undefined,
      price: raw.price ?? undefined,
      color: raw.color,
      status: newStatus,
    }, token).catch(() => {
      setRawEvents((prev) =>
        prev.map((e) => (e.id === raw.id ? { ...e, status: raw.status } : e)),
      );
    });
  };

  /* ── 이벤트 생성 완료 ── */
  const handleEventCreated = (event: EventResponse) => {
    setRawEvents((prev) => [...prev, event]);
    setShowCreateModal(false);
  };

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
    if (key === "dashboard")    { router.push("/dashboard");              return; }
    if (key === "place")        { router.push("/dashboard/travel");       return; }
    if (key === "ai")           { router.push("/dashboard/ai");           return; }
    if (key === "member")       { router.push("/dashboard/member");       return; }
    if (key === "chat")         { router.push("/dashboard/chat");         return; }
    if (key === "notification") { router.push("/dashboard/notification"); return; }
    if (key === "settings")     { router.push("/dashboard/settings");     return; }
    if (key === "schedule")     return;
    showToast();
  };

  /* ── 인증 대기 ── */
  if (!token) return <LoadingScreen />;

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans">
      {/* ══════════════ GNB ══════════════ */}
      <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <button onClick={() => router.push("/dashboard/home")} className="cursor-pointer border-none bg-transparent p-0">
          <Logo className="h-9" />
        </button>

        <div className="flex h-9 w-[280px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="장소, 일정 검색"
            className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← 대시보드
        </button>
      </header>

      {/* ══════════════ 본문 3단 ══════════════ */}
      <div className="flex min-h-0 flex-1">

        {/* ── 좌측 사이드바 ── */}
        <aside className="flex h-full w-[200px] flex-shrink-0 flex-col border-r border-slate-100 bg-white">
          <div className="mx-3 mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
            📅 일정
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
            {([
              { key: "dashboard",    label: "대시보드" , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { key: "schedule",     label: "일정"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { key: "place",        label: "장소"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> },
              { key: "ai",           label: "AI 추천"  , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2z"/></svg> },
              { key: "member",       label: "멤버"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { key: "chat",         label: "채팅"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge: <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" /> },
              { key: "notification", label: "알림"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
              { key: "settings",     label: "설정"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  item.key === "schedule"
                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {"badge" in item && item.badge}
              </button>
            ))}
          </nav>

          {/* 하단 프로필 */}
          <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-lg px-1 py-1.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {username[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">{username}</p>
                <p className="text-xs text-slate-400">{planLabel}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── 중앙 캘린더 콘텐츠 ── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-slate-50 px-8 py-6">

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
                      onClick={() => handleToggleStatus(evt.id)}
                      className="ml-3 flex-shrink-0 cursor-pointer rounded-2xl border-none px-3 py-1.5 text-[12px] font-semibold text-white"
                      style={{ background: "#4A6CF7", borderRadius: "24px" }}
                    >
                      확정
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(evt.id)}
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
            onClick={() => spaceId ? setShowCreateModal(true) : showToast()}
            className="mt-4 w-full cursor-pointer rounded-2xl border-none py-3 text-[14px] font-semibold text-white"
            style={{ background: "#4A6CF7", borderRadius: "24px" }}
          >
            + 일정 추가
          </button>
        </aside>

      </div>

      <Toast visible={visible} />

      {showCreateModal && spaceId && (
        <CreateEventModal
          spaceId={spaceId}
          token={token}
          defaultDate={selectedDate}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
