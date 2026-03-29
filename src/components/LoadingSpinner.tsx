import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-24 h-24 border-8",
  };

  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      <div
        className={cn(
          "rounded-full border-primary border-t-transparent animate-spin shadow-2xl shadow-primary/10",
          sizes[size]
        )}
      />
    </div>
  );
}
