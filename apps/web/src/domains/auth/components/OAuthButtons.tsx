"use client";

import { Button } from "@/components/Button";

export function OAuthButtons() {
  const handleOAuth = (provider: "google" | "naver" | "kakao") => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <Button variant="google" type="button" onClick={() => handleOAuth("google")}>
        Google로 계속하기
      </Button>
      <Button variant="naver" type="button" onClick={() => handleOAuth("naver")}>
        네이버로 계속하기
      </Button>
      <Button variant="kakao" type="button" onClick={() => handleOAuth("kakao")}>
        카카오로 계속하기
      </Button>
    </div>
  );
}
