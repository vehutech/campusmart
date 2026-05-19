import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] transition-all duration-200",
              "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]",
              "hover:border-[var(--text-subtle)]",
              error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--red)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
