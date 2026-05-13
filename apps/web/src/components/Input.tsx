import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, trailing, ...rest },
  ref,
) {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        {...rest}
        className={cn(
          "h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none",
          trailing ? "pr-16" : "",
          className,
        )}
      />
      {trailing && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          {trailing}
        </div>
      )}
    </div>
  );
});
