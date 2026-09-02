"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { login, refreshAccessToken } from "@/domains/auth/api";
import {
  persistSession,
  getAutoLoginEnabled,
  setAutoLoginEnabled,
} from "@/domains/auth/session";

export function LoginForm() {
  const router = useRouter();

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin,    setAutoLogin]    = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // 자동 로그인 설정 복원 + 자동 로그인 시도
  useEffect(() => {
    const autoLoginOn = getAutoLoginEnabled();
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ username, password });
      if (result.success && result.data) {
        setAutoLoginEnabled(autoLogin);
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
            className="text-xs font-semibold text-orbit-point"
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        }
      />

      <label className="flex cursor-pointer select-none items-center justify-end gap-1.5 px-1 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={autoLogin}
          onChange={(e) => setAutoLogin(e.target.checked)}
          className="accent-orbit-point"
        />
        자동 로그인
      </label>

      {error && <p className="px-1 text-xs text-orbit-point">{error}</p>}

      <Button variant="orbit" type="submit" disabled={loading} className="mt-1">
        {loading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
