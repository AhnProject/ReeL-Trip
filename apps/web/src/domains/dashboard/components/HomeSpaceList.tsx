import type { TeamSpace } from "@/domains/teamspace/types";

interface Props {
  spaces: TeamSpace[];
  onEnter: (space: TeamSpace) => void;
  onSeeAll: () => void;
}

export function HomeSpaceList({ spaces, onEnter, onSeeAll }: Props) {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-base font-bold text-slate-900">내 팀스페이스</span>
        <button
          onClick={onSeeAll}
          className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-brand-primary"
        >
          모두 보기 →
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="flex items-center gap-3.5 rounded-[14px] border border-[#EEF2FF] bg-white px-[18px] py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            {/* 이모지 아이콘 */}
            <div
              className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-[14px]"
              style={{ background: space.bgColor + "22" }}
            >
              <span className="text-2xl">{space.emoji}</span>
            </div>

            {/* 정보 */}
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-sm font-bold text-slate-900">{space.name}</p>
              <p className="mb-1.5 text-xs text-slate-400">
                멤버 {space.members.length}명 · 일정 {space.events.length}개
              </p>
              <div className="flex gap-0.5">
                {space.members.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    title={m.username}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: m.avatarColor }}
                  >
                    {m.username[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* 입장 버튼 */}
            <button
              onClick={() => onEnter(space)}
              className="flex-shrink-0 cursor-pointer rounded-lg border border-brand-primary bg-[#EEF2FF] px-[18px] py-[7px] text-[13px] font-bold text-brand-primary"
            >
              입장
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
