import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function AuthCard({ children }: Props) {
  return (
    <div
      className="w-full max-w-[400px] rounded-[17px] border border-[#E5E7EB] bg-[#E7EDFF]"
      style={{ padding: "43px 21px 30px 28px" }}
    >
      {children}
    </div>
  );
}
