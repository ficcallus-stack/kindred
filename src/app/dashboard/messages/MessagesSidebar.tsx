"use client";

import { useMemo } from "react";
import { Search, ShieldCheck, MessageCircle, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface MessagesSidebarProps {
  conversations: any[];
  supportConversations: any[];
  onlineUserIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startNewChat: (userId: string) => void;
  contactIds?: string[];
}

export default function MessagesSidebar({
  conversations,
  supportConversations,
  onlineUserIds,
  searchQuery,
  setSearchQuery,
  startNewChat,
  contactIds = [],
}: MessagesSidebarProps) {
  const params = useParams();
  const selectedConvoId = params.convoId as string;

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.otherMember?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  return (
    <aside className="flex flex-col bg-white h-full transition-all w-full relative">
      {/* Header */}
      <div className="p-5 pb-0 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg text-slate-800">Messages</h1>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md tabular-nums">
            {conversations.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:ring-2 focus:ring-blue-100 focus:border-blue-200 focus:bg-white placeholder:text-slate-400 font-medium transition-all outline-none"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        </div>
      </div>

      {/* Support Card */}
    <div className="px-5 pt-4 pb-2 shrink-0">
        <div
          className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group"
          onClick={() => startNewChat("kindred-support")}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors p-1 border border-slate-100">
              <Image src="/images/kindredLogo/logomark.png" alt="KindredCare US" width={28} height={28} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[#0a2540] font-bold text-[13px] block leading-tight">KindredCare US Support</span>
                <BadgeCheck size={14} className="text-blue-600 fill-blue-50" />
              </div>
              <span className="text-slate-500 text-[11px] font-medium mt-0.5 block">Online • Assistance</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 mt-3 px-2">
          Conversations
        </p>
        <div className="space-y-0.5">
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle size={24} className="text-slate-300 mb-3" />
              <p className="text-[13px] text-slate-400 font-medium">No conversations yet</p>
              <p className="text-[11px] text-slate-300 mt-1">Start one from a nanny profile</p>
            </div>
          )}

          {filteredConversations.map((convo) => {
            const isActive = selectedConvoId === convo.id;
            const isOnline = onlineUserIds.has(convo.otherMember?.id);
            const timeAgo = convo.updatedAt && new Date(convo.updatedAt).getTime() > 0
              ? formatDistanceToNow(new Date(convo.updatedAt), { addSuffix: true })
              : null;

            return (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group",
                  isActive
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-slate-50 border border-transparent"
                )}
                onClick={() => startNewChat(convo.otherMember?.id)}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {convo.otherMember?.profileImageUrl ? (
                    <Image
                      src={convo.otherMember.profileImageUrl}
                      alt={convo.otherMember.fullName}
                      width={44}
                      height={44}
                      className="rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-semibold text-slate-500 text-sm shadow-sm">
                      {convo.otherMember?.fullName?.charAt(0) || "?"}
                    </div>
                  )}
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-[13px] font-semibold truncate leading-tight",
                      isActive ? "text-blue-700" : "text-slate-700"
                    )}>
                      {convo.otherMember?.fullName}
                    </p>
                    {timeAgo && (
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 tabular-nums">
                        {timeAgo.replace("about ", "~").replace(" ago", "")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={cn(
                      "text-[11px] truncate max-w-[140px]",
                      isActive ? "text-blue-500/80" : "text-slate-500",
                      convo.lastMessage ? "font-medium" : "italic text-slate-400"
                    )}>
                      {convo.lastMessage || (isOnline ? "Online now" : (convo.isPseudo ? "Tap to chat" : "Offline"))}
                    </p>
                    {contactIds?.includes(convo.otherMember?.id) && (
                      <span className="flex items-center gap-0.5 text-[8px] font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0 border border-emerald-100/50">
                        Care Circle
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
