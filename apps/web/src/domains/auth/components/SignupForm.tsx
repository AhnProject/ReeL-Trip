"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { signup } from "@/domains/auth/api";
import { persistSession } from "@/domains/auth/session";

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signup(form);
      if (result.success && result.data) {
        persistSession(result.data);
        router.push("/dashboard/home");
      } else {
        setError(result.message ?? "회원가입 실패");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const update =
    <K extends keyof typeof form>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="아이디 (3자 이상)"
        value={form.username}
        onChange={update("username")}
        autoComplete="username"
        required
      />
      <Input
        type="email"
        placeholder="이메일 주소"
        value={form.email}
        onChange={update("email")}
        autoComplete="email"
        required
      />
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="비밀번호 (8자 이상)"
        value={form.password}
        onChange={update("password")}
        autoComplete="new-password"
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
      {error && <p className="text-xs text-accent-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}
