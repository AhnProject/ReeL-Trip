import { cn } from "@/lib/cn";
import type { TeamSpace } from "@/domains/teamspace/types";

const DAYS_SHORT = ["일", "월", "화", "수", "목", "금", "토"];
const DAYS_FULL  = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export interface TodayEvent {
  id: number;
  title: string;
  time: string;
  price: string;
  confirmed: boolean;
}

function getWeekDates(ref: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ref);
    d.setDate(ref.getDate() - ref.getDay() + i);
    return d;
  });
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  spaces: TeamSpace[];
  todayEvents: TodayEvent[];
  onEnterSpace: (space: TeamSpace) => void;
  onMoreClick: () => void;
  onScheduleActionClick: (id: number, confirmed: boolean) => void;
}

export function HomeCalendarWidget({ spaces, todayEvents, onEnterSpace, onMoreClick, onScheduleActionClick }: Props) {
  const today = new Date();
  const week  = getWeekDates(today);

  return (
    <aside className="sticky top-20 flex w-80 min-w-[320px] flex-col self-start rounded-[20px] border border-[#EEF2FF] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
      {/* 날짜 헤더 */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="mb-0.5 text-base font-bold text-slate-900">
            오늘, {DAYS_FULL[today.getDay()]}
          </p>
          <p className="text-[13px] text-slate-400">{fmtDate(today)}</p>
        </div>
        <button
          onClick={onMoreClick}
          className="cursor-pointer border-none bg-transparent pt-0.5 text-[13px] font-semibold text-brand-primary"
        >
          더보기 &rsaquo;
        </button>
      </div>

      {/* 주간 캘린더 */}
      <div className="mb-5 grid grid-cols-7">
        {week.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          const isSun   = i === 0;
          const isSat   = i === 6;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  isSun && "text-red-500",
                  isSat && "text-brand-primary",
                  !isSun && !isSat && "text-slate-400",
                )}
              >
                {DAYS_SHORT[i]}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors",
                  isToday && "bg-brand-primary font-bold text-white shadow-[0_4px_12px_rgba(74,108,247,0.35)]",
                  !isToday && isSun && "text-red-500",
                  !isToday && isSat && "text-brand-primary",
                  !isToday && !isSun && !isSat && "text-slate-900",
                )}
              >
                {d.getDate()}
              </span>
              {isToday && <div className="-mt-1 h-1 w-1 rounded-full bg-brand-primary" />}
            </div>
          );
        })}
      </div>

      <div className="my-4 h-px bg-slate-100" />

      {/* 오늘의 일정 */}
      <p className="mb-2.5 text-[13px] font-bold tracking-[0.02em] text-slate-600">
        오늘의 일정
      </p>
      {todayEvents.length === 0 ? (
        <div className="py-3 text-center text-[13px] text-slate-400">오늘 일정이 없습니다</div>
      ) : (
        todayEvents.map((sc) => (
          <div
            key={sc.id}
            className="mb-2 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
          >
            <div
              className="h-9 w-0.5 flex-shrink-0 rounded-sm"
              style={{ background: sc.confirmed ? "#4A6CF7" : "#E2E8F0" }}
            />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[13px] font-bold text-slate-900">{sc.title}</p>
              <p className="text-[11px] text-slate-400">
                {sc.time && `🕐 ${sc.time}`}
                {sc.time && sc.price && " · "}
                {sc.price}
              </p>
            </div>
            <button
              onClick={() => onScheduleActionClick(sc.id, sc.confirmed)}
              className={cn(
                "flex-shrink-0 cursor-pointer rounded-lg border-none px-3 py-[5px] text-xs font-bold",
                sc.confirmed ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-400",
              )}
            >
              {sc.confirmed ? "확정" : "미정"}
            </button>
          </div>
        ))
      )}

      <div className="my-4 h-px bg-slate-100" />

      {/* 팀스페이스 바로가기 */}
      <p className="mb-2.5 text-[13px] font-bold tracking-[0.02em] text-slate-600">
        팀스페이스 바로가기
      </p>
      {spaces.map((space) => (
        <button
          key={space.id}
          onClick={() => onEnterSpace(space)}
          className="mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-none bg-transparent px-3 py-[9px] text-left"
        >
          <span className="text-lg">{space.emoji}</span>
          <span className="flex-1 text-[13px] font-medium text-slate-700">{space.name}</span>
          <span className="text-base text-slate-300">›</span>
        </button>
      ))}
    </aside>
  );
}
