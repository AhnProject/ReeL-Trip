import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "google" | "naver" | "kakao";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primaryHover disabled:opacity-60",
  google:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  naver: "bg-oauth-naver text-white hover:brightness-95",
  kakao: "bg-oauth-kakao text-slate-900 hover:brightness-95",
};

export function Button({
  variant = "primary",
  fullWidth = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "h-12 rounded-md text-sm font-semibold transition",
        fullWidth && "w-full",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
