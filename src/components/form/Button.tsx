import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "right",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95",
    secondary: "bg-secondary text-white shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95",
    outline: "bg-transparent border-2 border-outline text-primary hover:bg-surface-container-low",
    ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-low",
    danger: "bg-error text-white shadow-xl shadow-error/20 hover:scale-105 active:scale-95",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-xl",
    md: "px-8 py-4 text-[10px] rounded-2xl",
    lg: "px-10 py-5 text-xs rounded-[1.5rem]",
    xl: "px-12 py-6 text-sm rounded-[2rem]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && <MaterialIcon name={icon} className="text-lg" />}
          {children}
          {icon && iconPosition === "right" && <MaterialIcon name={icon} className="text-lg" />}
        </>
      )}
    </button>
  );
}
