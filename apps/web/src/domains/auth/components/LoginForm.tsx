"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { login, refreshAccessToken } from "@/domains/auth/api";
import {
  persistSession,
  getSavedUsername,
  setSavedUsername,
  getAutoLoginEnabled,
  setAutoLoginEnabled,
} from "@/domains/auth/session";

export function LoginForm() {
  const router = useRouter();

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveId,       setSaveId]       = useState(false);
  const [autoLogin,    setAutoLogin]    = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // 저장된 아이디 / 자동 로그인 설정 복원 + 자동 로그인 시도
  useEffect(() => {
    const savedName   = getSavedUsername();
    const autoLoginOn = getAutoLoginEnabled();

    if (savedName) {
      setUsername(savedName);
      setSaveId(true);
    }
    setAutoLogin(autoLoginOn);

    if (autoLoginOn) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        setLoading(true);
        refreshAccessToken(refreshToken)
          .then((res) => {
            if (res.success && res.data) {
              persistSession(res.data, true);
              router.push("/dashboard/home");
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ username, password });
      if (result.success && result.data) {
        setAutoLoginEnabled(autoLogin);
        setSavedUsername(username, saveId);
        persistSession(result.data, autoLogin);
        router.push("/dashboard/home");
      } else {
        setError(result.message ?? "로그인 실패");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoLogin = (checked: boolean) => {
    setAutoLogin(checked);
    if (checked && !saveId) setSaveId(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="text"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-xs font-semibold text-accent-danger"
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        }
      />

      <div className="flex justify-between text-sm text-secondary">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveId}
            onChange={(e) => {
              setSaveId(e.target.checked);
              if (!e.target.checked) setSavedUsername("", false);
            }}
            className="accent-primary"
          />
          아이디 저장
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => toggleAutoLogin(e.target.checked)}
            className="accent-primary"
          />
          자동 로그인
        </label>
      </div>

      {error && <p className="text-xs text-accent-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
