import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  fill?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export function MaterialIcon({ name, className, fill, size, style }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ 
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}`,
        fontSize: size ? `${size}px` : undefined,
        ...style 
      }}
    >
      {name}
    </span>
  );
}
