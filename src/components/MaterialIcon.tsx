import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function MaterialIcon({ name, className, fill, style }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ 
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}`,
        ...style 
      }}
    >
      {name}
    </span>
  );
}
