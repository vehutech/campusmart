import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg)]";

    const variants = {
      primary:
        "bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] focus:ring-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]",
      secondary:
        "bg-[var(--bg-elevated)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)] focus:ring-[var(--border)]",
      outline:
        "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)] focus:ring-[var(--accent)]",
      ghost:
        "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] focus:ring-[var(--border)]",
      danger:
        "bg-[var(--red)] text-white hover:opacity-90 focus:ring-[var(--red)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
