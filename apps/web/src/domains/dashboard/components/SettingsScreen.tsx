"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces, updateTeamSpace, deleteTeamSpace } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { getProfile, updateProfile, updateAvatar } from "@/domains/user/api";
import { getNotificationSettings, updateNotificationSettings } from "@/domains/notification/api";
import type { NotificationSettingsResponse } from "@/domains/notification/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";
import { pickSpace, setSelectedSpaceId } from "@/lib/space";

type TabKey = "profile" | "space" | "notification" | "account";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile",      label: "프로필"   },
  { key: "space",        label: "여행 스페이스" },
  { key: "notification", label: "알림 설정" },
  { key: "account",      label: "계정"     },
];

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername]       = useState("");
  const [token, setToken]             = useState("");
  const [email, setEmail]             = useState("");
  const [avatar, setAvatar]           = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [spaces, setSpaces]           = useState<TeamSpaceResponse[]>([]);
  const [spaceId, setSpaceId]         = useState<number | null>(null);
  const [spaceName, setSpaceName]     = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji]   = useState("✈️");
  const [spaceNameDraft, setSpaceNameDraft]   = useState("");
  const [spaceEmojiDraft, setSpaceEmojiDraft] = useState("");
  const [spaceSaving, setSpaceSaving]     = useState(false);
  const [spaceDeleting, setSpaceDeleting] = useState(false);
  const [spaceMessage, setSpaceMessage]   = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [planLabel, setPlanLabel]     = useState("Free 플랜");
  const [joinedAt, setJoinedAt]       = useState("");
  const [activeTab, setActiveTab]     = useState<TabKey>(() => {
    const tabParam = searchParams.get("tab");
    return (TABS.some((t) => t.key === tabParam) ? tabParam : "profile") as TabKey;
  });
  const [notifSettings, setNotifSettings] = useState<NotificationSettingsResponse>({
    newPlace: true, scheduleChange: true, memberJoin: true, aiRecommend: false, chat: true,
  });
  const [notifError, setNotifError] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(name ?? "");
    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setSpaces(res.data);
        const sp = pickSpace(res.data) as TeamSpaceResponse;
        setSpaceId(sp.id);
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");
        setSpaceNameDraft(sp.name);
        setSpaceEmojiDraft(sp.emoji ?? "✈️");
      }
    }).catch((err) => console.error("[SettingsScreen]", err));
    getProfile(storedToken).then((res) => {
      if (res.success && res.data) {
        setPlanLabel(res.data.plan === "FREE" ? "Free 플랜" : "Pro 플랜");
        setEmail(res.data.email ?? "");
        setAvatar(res.data.avatar ?? null);
        setJoinedAt(res.data.createdAt.slice(0, 10).replaceAll("-", "."));
      }
    }).catch((err) => console.error("[SettingsScreen]", err));
    getNotificationSettings(storedToken).then((res) => {
      if (res.success && res.data) setNotifSettings(res.data);
    }).catch((err) => console.error("[SettingsScreen]", err));
  }, [router]);

  const handleSelectSpace = (id: string | number) => {
    const sp = spaces.find((s) => String(s.id) === String(id));
    if (!sp) return;
    setSpaceId(sp.id);
    setSpaceName(sp.name);
    setSpaceEmoji(sp.emoji ?? "✈️");
    setSpaceNameDraft(sp.name);
    setSpaceEmojiDraft(sp.emoji ?? "✈️");
    setSpaceMessage(null);
    setSelectedSpaceId(sp.id);
  };

  const selectedSpace = spaces.find((s) => s.id === spaceId);
  const owner         = selectedSpace?.members.find((m) => m.role === "owner");
  const isSpaceOwner   = !!owner && owner.username === username;

  const handleSaveSpace = async () => {
    if (!token || !spaceId || !spaceNameDraft.trim()) return;
    setSpaceSaving(true);
    setSpaceMessage(null);
    try {
      const res = await updateTeamSpace(spaceId, {
        name:    spaceNameDraft.trim(),
        emoji:   spaceEmojiDraft.trim() || undefined,
        bgColor: selectedSpace?.bgColor ?? undefined,
      }, token);
      if (res.success && res.data) {
        setSpaceName(res.data.name);
        setSpaceEmoji(res.data.emoji ?? "✈️");
        setSpaces((prev) => prev.map((s) => (s.id === spaceId ? res.data! : s)));
        setSpaceMessage({ type: "success", text: "스페이스 정보를 저장했습니다." });
      } else {
        setSpaceMessage({ type: "error", text: "저장에 실패했습니다." });
      }
    } catch {
      setSpaceMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setSpaceSaving(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!token || !spaceId || !selectedSpace) return;
    if (!window.confirm(`"${selectedSpace.name}" 스페이스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    setSpaceDeleting(true);
    setSpaceMessage(null);
    try {
      const res = await deleteTeamSpace(spaceId, token);
      if (res.success) {
        const remaining = spaces.filter((s) => s.id !== spaceId);
        setSpaces(remaining);
        if (remaining.length > 0) {
          handleSelectSpace(remaining[0].id);
        } else {
          setSpaceId(null);
          setSpaceName("여행 없음");
          setSpaceEmoji("✈️");
          setSpaceNameDraft("");
          setSpaceEmojiDraft("");
        }
        setSpaceMessage({ type: "success", text: "스페이스를 삭제했습니다." });
      } else {
        setSpaceMessage({ type: "error", text: "삭제에 실패했습니다." });
      }
    } catch {
      setSpaceMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setSpaceDeleting(false);
    }
  };

  const handleToggleNotifSetting = async (key: keyof NotificationSettingsResponse) => {
    if (!token) return;
    const next = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(next);
    setNotifError("");
    try {
      const res = await updateNotificationSettings(next, token);
      if (!res.success) {
        setNotifSettings(notifSettings);
        setNotifError("알림 설정 저장에 실패했습니다.");
      }
    } catch {
      setNotifSettings(notifSettings);
      setNotifError("서버 오류가 발생했습니다.");
    }
  };

  const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    setAvatarError("");

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("이미지 용량은 2MB 이하만 가능합니다.");
      return;
    }

    setAvatarUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const res = await updateAvatar(dataUrl, token);
      if (res.success && res.data) {
        setAvatar(res.data.avatar ?? null);
      } else if (res.errorCode === "AVATAR_TOO_LARGE") {
        setAvatarError("이미지 용량은 2MB 이하만 가능합니다.");
      } else if (res.errorCode === "INVALID_AVATAR_FORMAT") {
        setAvatarError("올바른 이미지 파일이 아닙니다.");
      } else {
        setAvatarError("사진 변경에 실패했습니다.");
      }
    } catch {
      setAvatarError("사진 변경에 실패했습니다.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await updateProfile({ email: email.trim() }, token);
      if (res.success && res.data) {
        setEmail(res.data.email ?? "");
        setProfileMessage({ type: "success", text: "프로필을 저장했습니다." });
      } else if (res.errorCode === "EMAIL_ALREADY_EXISTS") {
        setProfileMessage({ type: "error", text: "이미 사용 중인 이메일입니다." });
      } else {
        setProfileMessage({ type: "error", text: "저장에 실패했습니다. 잠시 후 다시 시도해주세요." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setProfileSaving(false);
    }
  };

  if (!username) return <LoadingScreen />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  return (
    <DashboardLayout
      activeNav="settings"
      username={username}
      spaceName={spaceName}
      spaceEmoji={spaceEmoji}
      spaces={spaces}
      onSelectSpace={handleSelectSpace}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">설정</h1>
      </div>

      <div className="flex gap-6">
        {/* 탭 사이드 */}
        <div className="w-[160px] flex-shrink-0">
          <nav className="flex flex-col gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  activeTab === tab.key
                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1">
          {/* 프로필 */}
          {activeTab === "profile" && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-900">프로필 설정</h2>
              <div className="mb-2 flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-primary text-xl font-bold text-white">
                  {avatar ? (
                    <img src={avatar} alt={username} className="h-full w-full object-cover" />
                  ) : (
                    username[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  {avatarUploading ? "업로드 중…" : "사진 변경"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>
              </div>
              {avatarError && <p className="mb-4 text-xs text-red-500">{avatarError}</p>}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">사용자명</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              {profileMessage && (
                <p className={cn("mt-3 text-xs", profileMessage.type === "error" ? "text-red-500" : "text-green-600")}>
                  {profileMessage.text}
                </p>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="mt-5 rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primaryHover disabled:opacity-50"
              >
                {profileSaving ? "저장 중…" : "저장"}
              </button>
            </div>
          )}

          {/* 여행 스페이스 */}
          {activeTab === "space" && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-900">여행 스페이스 설정</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">스페이스 이름</label>
                  <input
                    type="text"
                    value={spaceNameDraft}
                    onChange={(e) => setSpaceNameDraft(e.target.value)}
                    disabled={!isSpaceOwner}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">이모지</label>
                  <input
                    type="text"
                    value={spaceEmojiDraft}
                    onChange={(e) => setSpaceEmojiDraft(e.target.value)}
                    disabled={!isSpaceOwner}
                    className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
              {spaceMessage && (
                <p className={cn("mt-3 text-xs", spaceMessage.type === "error" ? "text-red-500" : "text-green-600")}>
                  {spaceMessage.text}
                </p>
              )}
              {isSpaceOwner ? (
                <>
                  <button
                    onClick={handleSaveSpace}
                    disabled={spaceSaving || !spaceNameDraft.trim()}
                    className="mt-5 rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primaryHover disabled:opacity-50"
                  >
                    {spaceSaving ? "저장 중…" : "저장"}
                  </button>
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="mb-2 text-sm font-bold text-red-500">위험 구역</p>
                    <button
                      onClick={handleDeleteSpace}
                      disabled={spaceDeleting}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      {spaceDeleting ? "삭제 중…" : "스페이스 삭제"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-5 text-xs text-slate-400">스페이스 이름/이모지 수정과 삭제는 소유자만 할 수 있어요.</p>
              )}
            </div>
          )}

          {/* 알림 설정 */}
          {activeTab === "notification" && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-900">알림 설정</h2>
              <div className="flex flex-col gap-4">
                {([
                  { key: "newPlace" as const,       label: "새 장소 추가",    desc: "팀원이 장소를 추가하면 알려드려요"    },
                  { key: "scheduleChange" as const,  label: "일정 변경",      desc: "일정이 수정되거나 삭제되면 알려드려요" },
                  { key: "memberJoin" as const,      label: "멤버 참여",      desc: "새 멤버가 스페이스에 참여하면 알려드려요" },
                  { key: "chat" as const,            label: "채팅 메시지",    desc: "새 채팅 메시지가 오면 알려드려요" },
                  { key: "aiRecommend" as const,     label: "AI 추천 도착",   desc: "AI 추천 장소가 준비되면 알려드려요"  },
                ]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleNotifSetting(item.key)}
                      className={cn(
                        "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
                        notifSettings[item.key] ? "bg-brand-primary" : "bg-slate-200",
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        notifSettings[item.key] ? "left-5" : "left-0.5",
                      )} />
                    </button>
                  </div>
                ))}
              </div>
              {notifError && <p className="mt-3 text-xs text-red-500">{notifError}</p>}
            </div>
          )}

          {/* 계정 */}
          {activeTab === "account" && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-900">계정 정보</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">현재 플랜</span>
                  <span className="text-sm font-semibold text-slate-900">{planLabel}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">가입일</span>
                  <span className="text-sm font-semibold text-slate-900">{joinedAt || "-"}</span>
                </div>
              </div>
              {planLabel === "Free 플랜" && (
                <button className="mt-4 w-full rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primaryHover">
                  Pro로 업그레이드
                </button>
              )}
              <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  로그아웃
                </button>
                <button className="w-full rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">
                  계정 탈퇴
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export function SettingsScreen() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}
