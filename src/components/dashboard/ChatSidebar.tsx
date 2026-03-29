"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatSidebarProps {
  conversations: any[];
  activeTab: "chats" | "archived" | "support";
  onTabChange: (tab: "chats" | "archived" | "support") => void;
  title?: string;
}

export function ChatSidebar({ conversations, activeTab, onTabChange, title = "Message Center" }: ChatSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col h-full w-80 bg-slate-50 border-r border-outline-variant/10 text-blue-900 font-body text-sm p-6 gap-2 sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-black text-primary font-headline tracking-tighter">{title}</h2>
        <p className="text-[10px] text-slate-500 opacity-60 uppercase tracking-[0.2em] font-black mt-1">Secure Editorial Messaging</p>
      </div>

      <Link 
        href="/browse"
        className="mb-8 w-full py-4 px-6 bg-primary text-on-primary rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 group"
      >
        <MaterialIcon name="edit_square" className="text-lg group-hover:rotate-12 transition-transform" />
        <span className="uppercase tracking-widest text-[10px]">Start New Thread</span>
      </Link>

      <nav className="space-y-2">
        <button 
          onClick={() => onTabChange("chats")}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-bold",
            activeTab === "chats" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
          )}
        >
          <MaterialIcon name="chat_bubble" className={cn("text-xl", activeTab === "chats" ? "text-primary" : "text-slate-400")} fill={activeTab === "chats"} />
          <span className="tracking-tight">Active Chats</span>
        </button>

        <button 
          onClick={() => onTabChange("archived")}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-bold",
            activeTab === "archived" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
          )}
        >
          <MaterialIcon name="inventory_2" className={cn("text-xl", activeTab === "archived" ? "text-primary" : "text-slate-400")} fill={activeTab === "archived"} />
          <span className="tracking-tight">Archived</span>
        </button>

        <button 
          onClick={() => onTabChange("support")}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-bold",
            activeTab === "support" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
          )}
        >
          <MaterialIcon name="support_agent" className={cn("text-xl", activeTab === "support" ? "text-primary" : "text-slate-400")} fill={activeTab === "support"} />
          <span className="tracking-tight">Support Hub</span>
        </button>

        <Link 
          href="/dashboard"
          className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-slate-200/50 transition-all rounded-xl font-bold"
        >
          <MaterialIcon name="verified_user" className="text-xl text-slate-400" />
          <span className="tracking-tight">Safety Hub</span>
        </Link>
      </nav>

      {/* Recents Section */}
      <div className="mt-12">
        <h3 className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Contacts</h3>
        <div className="space-y-3">
          {conversations.length > 0 ? conversations.map((convo) => {
            const isActive = pathname.includes(convo.id);
            const otherMember = convo.otherMembers?.[0];
            const lastMsg = convo.lastMessage;

            return (
              <Link
                key={convo.id}
                href={`/dashboard/messages/${convo.id}`}
                className={cn(
                  "p-4 rounded-2xl transition-all flex items-center gap-4 group",
                  isActive ? "bg-white shadow-xl border-l-4 border-primary" : "hover:bg-white/50"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary border border-outline-variant/10">
                    {otherMember?.fullName?.charAt(0) || convo.title?.charAt(0) || "?"}
                  </div>
                  {otherMember && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-50 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn("text-sm font-bold truncate tracking-tight", isActive ? "text-primary" : "text-slate-700")}>
                      {otherMember?.fullName || convo.title || "Support Thread"}
                    </span>
                    {otherMember?.isVerified && (
                      <MaterialIcon name="verified" className="text-secondary text-[10px]" fill />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate opacity-60 italic">
                    {lastMsg?.content || "Tap to start chatting..."}
                  </p>
                </div>
              </Link>
            );
          }) : (
            <p className="px-5 text-xs text-slate-400 italic">No recent activity</p>
          )}
        </div>
      </div>
    </aside>
  );
}
