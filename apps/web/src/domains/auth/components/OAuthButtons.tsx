"use client";

import { Button } from "@/components/Button";
import { Toast, useToast } from "@/components/Toast";

export function OAuthButtons() {
  const { visible, showToast } = useToast();

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button variant="google" type="button" onClick={showToast}>
          Google로 계속하기
        </Button>
        <Button variant="naver" type="button" onClick={showToast}>
          네이버로 계속하기
        </Button>
        <Button variant="kakao" type="button" onClick={showToast}>
          카카오로 계속하기
        </Button>
      </div>
      <Toast visible={visible} />
    </>
  );
}
