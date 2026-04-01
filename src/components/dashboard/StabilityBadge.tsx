"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface StabilityBadgeProps {
  createdAt: Date;
  size?: "sm" | "md" | "lg";
}

export function StabilityBadge({ createdAt, size = "md" }: StabilityBadgeProps) {
  const days = differenceInDays(new Date(), createdAt);
  
  let label = "Newbie";
  let icon = "child_care";
  let color = "text-slate-400 bg-slate-50 border-slate-200";
  let fill = false;

  if (days >= 365) {
    label = "Kindred Legend";
    icon = "workspace_premium";
    color = "text-amber-600 bg-amber-50 border-amber-200 shadow-lg shadow-amber-500/10";
    fill = true;
  } else if (days >= 180) {
    label = "Gold Kindred";
    icon = "military_tech";
    color = "text-yellow-600 bg-yellow-50 border-yellow-200";
    fill = true;
  } else if (days >= 90) {
    label = "Silver Regular";
    icon = "stars";
    color = "text-blue-600 bg-blue-50 border-blue-200";
    fill = true;
  } else if (days >= 30) {
    label = "Solid Bond";
    icon = "favorite";
    color = "text-rose-500 bg-rose-50 border-rose-100";
  }

  const sizeClasses = {
     sm: "px-2 py-0.5 text-[8px] gap-1",
     md: "px-3 py-1 text-[9px] gap-1.5",
     lg: "px-4 py-2 text-[10px] gap-2"
  };

  return (
    <div className={cn(
      "inline-flex items-center font-black uppercase tracking-widest rounded-full border transition-all hover:scale-105",
      color,
      sizeClasses[size]
    )}>
      <MaterialIcon name={icon} className={cn(size === "sm" ? "text-[10px]" : "text-xs")} fill={fill} />
      {label}
    </div>
  );
}
