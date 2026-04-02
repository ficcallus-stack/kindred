"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

interface ModeratorSupportSidebarProps {
  conversations: any[];
  activeId: string;
}

export function ModeratorSupportSidebar({ conversations, activeId }: ModeratorSupportSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "archived">("active");

  const filtered = conversations
    .filter(convo => {
      // 1. Status Filter
      const isArchived = convo.supportStatus === "closed";
      if (filter === "active" && isArchived) return false;
      if (filter === "archived" && !isArchived) return false;

      // 2. Search Filter
      const otherMember = convo.members.find((m: any) => m.user?.role !== "moderator" && m.user?.role !== "admin")?.user;
      return otherMember?.fullName?.toLowerCase().includes(search.toLowerCase());
    })
    .slice(0, 10); // Limit to 10 as requested

  return (
    <section className="w-80 bg-slate-50 border-r border-slate-200/50 flex flex-col shrink-0">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-30 italic">Support Desk</span>
            <h2 className="font-headline italic font-black text-3xl text-primary lowercase first-letter:uppercase tracking-tighter">Support Queue</h2>
        </div>
        
        <div className="flex p-1 bg-slate-200/50 rounded-2xl gap-1">
          <button 
            onClick={() => setFilter("active")}
            className={cn(
                "flex-1 py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 uppercase tracking-widest transition-all",
                filter === "active" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <MaterialIcon name="bolt" className="text-sm" /> Active
          </button>
          <button 
            onClick={() => setFilter("archived")}
            className={cn(
                "flex-1 py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 uppercase tracking-widest transition-all",
                filter === "archived" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <MaterialIcon name="archive" className="text-sm" /> Archived
          </button>
        </div>

        <div className="relative">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 text-sm focus:ring-2 focus:ring-primary/10 shadow-sm font-medium tracking-tight placeholder:text-slate-300 outline-none" 
            placeholder="Search by name..." 
          />
          <MaterialIcon name="search" className="absolute left-4 top-3 text-slate-400 text-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-8 custom-scrollbar">
        {filtered.map((convo) => {
          const otherMember = convo.members.find((m: any) => m.user?.role !== "moderator" && m.user?.role !== "admin")?.user;
          const isActive = convo.id === activeId;
          const lastMsg = convo.messages?.[0]?.content || "No messages yet";
          
          if (!otherMember) return null;

          return (
            <Link 
              key={convo.id}
              href={`/dashboard/moderator/support/${convo.id}`}
              className={cn(
                "block p-5 rounded-[2rem] transition-all cursor-pointer border group relative",
                isActive 
                  ? "bg-white shadow-xl border-primary" 
                  : "bg-transparent hover:bg-white hover:shadow-lg border-transparent"
              )}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                    {otherMember.profileImageUrl ? (
                        <Image 
                            src={otherMember.profileImageUrl} 
                            alt={otherMember.fullName} 
                            width={40} 
                            height={40} 
                            className="rounded-2xl border border-slate-100 shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs italic border border-primary/10">
                            {otherMember.fullName.charAt(0)}
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center whitespace-nowrap">
                        <span className="font-black text-sm text-primary tracking-tight truncate pr-2">{otherMember.fullName}</span>
                        <span className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">
                        {formatDistanceToNow(new Date(convo.updatedAt), { addSuffix: false }).replace('about ', '')}
                        </span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                        Patient ID: #{otherMember.id.slice(0, 6)}
                    </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-medium leading-relaxed italic opacity-80 pl-1 border-l-2 border-slate-100 group-hover:border-primary transition-colors">
                "{lastMsg}"
              </p>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center space-y-4">
            <MaterialIcon name="sentiment_dissatisfied" className="text-4xl text-slate-200" />
            <p className="text-xs text-slate-400 font-medium italic">No tickets found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
