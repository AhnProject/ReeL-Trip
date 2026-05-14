"use client";

import { Button } from "@/components/Button";

function notReady(provider: string) {
  alert(`${provider} 로그인은 준비 중입니다.`);
}

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button variant="google" type="button" onClick={() => notReady("Google")}>
        Google로 계속하기
      </Button>
      <Button variant="naver" type="button" onClick={() => notReady("네이버")}>
        네이버로 계속하기
      </Button>
      <Button variant="kakao" type="button" onClick={() => notReady("카카오")}>
        카카오로 계속하기
      </Button>
    </div>
  );
}
