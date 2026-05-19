import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]",
    success: "bg-[rgba(0,229,160,0.1)] text-[var(--green)] border border-[rgba(0,229,160,0.2)]",
    warning: "bg-[rgba(255,125,59,0.1)] text-[var(--orange)] border border-[rgba(255,125,59,0.2)]",
    danger: "bg-[rgba(255,77,109,0.1)] text-[var(--red)] border border-[rgba(255,77,109,0.2)]",
    info: "bg-[var(--accent-glow)] text-[var(--accent)] border border-[rgba(0,212,255,0.2)]",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
