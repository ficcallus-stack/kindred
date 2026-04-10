"use client";

import { useState, useMemo, createContext, useContext, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MessagesSidebar from "./MessagesSidebar";
import { getOrCreateConversation, getConversationMetadata, syncChatUnlock } from "./actions";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import { createAblyClient } from "@/lib/ably";
import { Realtime } from "ably";
import { cn } from "@/lib/utils";
import { Loader2, Wifi, WifiOff, ChevronLeft } from "lucide-react";
import { type User } from "firebase/auth";
import { useToast } from "@/components/Toast";

// Our simplified context for app-specific state (like currentUser)
const MessagesContext = createContext<{
  onlineUserIds: Set<string>;
  currentUser: any;
  idToken: string | null;
  ably: Realtime | null;
  ablyStatus: string;
} | null>(null);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) throw new Error("useMessages must be used within a MessagesProvider");
  return context;
};

interface MessagesLayoutClientProps {
  currentUser: any;
  initialConversations: any[];
  supportConversations: any[];
  children?: React.ReactNode;
  contactIds?: string[];
}

export default function MessagesLayoutClient({
  currentUser,
  initialConversations,
  supportConversations,
  children,
  contactIds = [],
}: MessagesLayoutClientProps) {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [ably, setAbly] = useState<any>(null);
  const [ablyStatus, setAblyStatus] = useState<string>("connecting");

  // Real-time local state to allow instant updates
  const [conversations, setConversations] = useState(initialConversations);
  const [supportConvos, setSupportConvos] = useState(supportConversations);
  
  const { showToast } = useToast();

  // 1. Get Token (Standard handshake identity)
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onIdTokenChanged(async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
        } catch (err) {
          console.error("[Hub] Failed to get token:", err);
        } finally {
          setTokenLoading(false);
        }
      } else {
        setTokenLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const ablyRef = useRef<any>(null);
  const identityRef = useRef<{ id: string; token: string | null } | null>(null);

  // 2. Persistent Ably Connection & Real-time Synchronization
  useEffect(() => {
    if (!currentUser?.id) return;

    // Stability Check: Only recreate if the user actually changed
    if (identityRef.current?.id === currentUser.id && ablyRef.current) {
      return;
    }

    // Close existing if identity changed
    if (ablyRef.current) {
      ablyRef.current.close();
    }

    const client = createAblyClient(currentUser.id);
    if (!client) return;

    ablyRef.current = client;
    identityRef.current = { id: currentUser.id, token: null };
    setAbly(client);

    client.connection.on((state) => {
      setAblyStatus(state.current);
    });

    const globalChannel = client.channels.get("global:presence");
    const notificationsChannel = client.channels.get(`notifications:${currentUser.id}`);

    // Presence logic...
    globalChannel.presence.subscribe("enter", (member) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(member.clientId);
        return next;
      });
    });
    globalChannel.presence.subscribe("leave", (member) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(member.clientId);
        return next;
      });
    });
    globalChannel.presence.enter();

    // REAL-TIME CONVERSATION SYNC
    notificationsChannel.subscribe("new_message", async (msg: any) => {
      const { conversationId } = msg.data;
      console.log(`[Realtime Sync] New message in convo: ${conversationId}`);
      
      try {
        const updatedMetadata = await getConversationMetadata(conversationId);
        if (!updatedMetadata) return;

        if (updatedMetadata.isSupport) {
          setSupportConvos(prev => {
             const others = prev.filter(c => c.id !== conversationId);
             return [updatedMetadata, ...others];
          });
        } else {
          setConversations(prev => {
            const others = prev.filter(c => c.id !== conversationId);
            // Move to top and update metadata
            return [updatedMetadata, ...others];
          });
          
          // Show toast if not active child
          const isViewing = window.location.pathname.includes(conversationId);
          if (!isViewing) {
            showToast(`New message from ${updatedMetadata.otherMember?.fullName || 'someone'}`, "success");
          }
        }
      } catch (err) {
        console.error("[Realtime Sync] Failed to update metadata:", err);
      }
    });

    return () => {
      // Don't close immediately — let identity check on next render decide
    };
  }, [currentUser?.id]);

  const searchParams = useSearchParams();
  const [syncing, setSyncing] = useState(false);

  // 3. Fast-Track Payment Sync
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const unlocked = searchParams.get("unlocked");

    if (sessionId && unlocked === "true" && !syncing) {
      setSyncing(true);
      (async () => {
        try {
          console.log("[Sync] Triggering fast-track for session:", sessionId);
          await syncChatUnlock(sessionId);
          showToast("Chat unlocked successfully!", "success");
        } catch (err) {
          console.error("[Sync] Fast-track failed:", err);
          showToast("Failed to verify payment. Please wait a moment.", "error");
        } finally {
          setSyncing(false);
          // Clean the URL to avoid re-syncing on refresh
          const params = new URLSearchParams(window.location.search);
          params.delete("session_id");
          params.delete("unlocked");
          params.delete("unlocked_id");
          const target = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState(null, "", target);
        }
      })();
    }
  }, [searchParams]);

  if (tokenLoading || syncing)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            {syncing ? "Unlocking Professional Access..." : "Connecting to Hub..."}
          </p>
        </div>
      </div>
    );

  return (
    <MessagesContext.Provider value={{ onlineUserIds, currentUser, idToken, ably, ablyStatus }}>
      <MessagesLayoutContent
        currentUser={currentUser}
        initialConversations={conversations}
        supportConversations={supportConvos}
        onlineUserIds={onlineUserIds}
        contactIds={contactIds}
      >
        {children}
      </MessagesLayoutContent>
    </MessagesContext.Provider>
  );
}

function MessagesLayoutContent({
  currentUser,
  initialConversations,
  supportConversations,
  onlineUserIds,
  contactIds,
  children,
}: any) {
  const { ablyStatus } = useMessages();
  const router = useRouter();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const isChatOpen = !!params.convoId;

  const dashboardLink = currentUser?.role === "caregiver" ? "/dashboard/nanny" : 
                        currentUser?.role === "parent" ? "/dashboard/parent" : 
                        currentUser?.role === "moderator" ? "/dashboard/moderator" : 
                        currentUser?.role === "admin" ? "/dashboard/admin" : "/dashboard";

  const startNewChat = async (userId: string) => {
    try {
      const convoId = await getOrCreateConversation(userId);
      router.push(`/dashboard/messages/${convoId}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  // 3. Auto-start chat from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get('userId');
    if (userId) {
      startNewChat(userId);
    }
  }, []);

  return (
    <div className="bg-white h-screen flex flex-col text-slate-800 overflow-hidden">
      <header className="h-14 bg-white border-b border-slate-100 flex justify-between items-center px-5 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href={dashboardLink} className="flex items-center gap-1 -ml-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft size={20} />
            <span className="font-semibold text-[14px]">Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
              ablyStatus === "connected"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            )}
          >
            {ablyStatus === "connected" ? <Wifi size={10} /> : <WifiOff size={10} />}
            <span className="capitalize">{ablyStatus}</span>
          </div>
          {currentUser?.profileImageUrl && (
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-slate-100">
              <Image src={currentUser.profileImageUrl} alt="Me" width={32} height={32} className="object-cover" />
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Persistent Sidebar (Full width on mobile if no chat open, fixed width on md) */}
        <div className={cn(
          "shrink-0 h-full z-10 bg-white border-r border-slate-100 transition-all",
          isChatOpen ? "hidden md:block w-80" : "w-full md:w-80 relative"
        )}>
          <MessagesSidebar
            conversations={initialConversations}
            supportConversations={supportConversations}
            onlineUserIds={onlineUserIds}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startNewChat={startNewChat}
            contactIds={contactIds}
          />
        </div>

        {/* Dynamic Chat Window Area (Full width on mobile if chat open, flex-1 on md) */}
        <div className={cn(
          "flex-1 overflow-hidden relative transition-all",
          !isChatOpen ? "hidden md:block" : "w-full md:w-auto"
        )}>
          <div className="h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
