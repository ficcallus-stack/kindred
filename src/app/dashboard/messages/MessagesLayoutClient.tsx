"use client";

import { useState, useMemo, createContext, useContext, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MessagesSidebar from "./MessagesSidebar";
import { getOrCreateConversation } from "./actions";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import { createAblyClient } from "@/lib/ably";
import { Realtime } from "ably";
import { cn } from "@/lib/utils";
import { Loader2, Wifi, WifiOff, ChevronLeft } from "lucide-react";
import { type User } from "firebase/auth";

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

  // 2. Persistent Ably Connection
  useEffect(() => {
    if (!idToken || !currentUser?.id) return;

    // Stability Check: Only recreate if the user or token actually changed
    if (identityRef.current?.id === currentUser.id && identityRef.current?.token === idToken) {
      return;
    }

    // Close existing if identity changed
    if (ablyRef.current) {
      ablyRef.current.close();
    }

    const client = createAblyClient(currentUser.id, idToken);
    if (!client) return;

    ablyRef.current = client;
    identityRef.current = { id: currentUser.id, token: idToken };
    setAbly(client);

    client.connection.on((state) => {
      setAblyStatus(state.current);
    });

    const globalChannel = client.channels.get("global:presence");

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

    globalChannel.presence.get()
      .then((members) => {
        if (members) {
          setOnlineUserIds(new Set(members.map((m: any) => m.clientId)));
        }
      })
      .catch((err) => console.error("[ABLY DEBUG] Presence Get Error (Layout):", err));

    globalChannel.presence.enter();

    return () => {
      // Don't close immediately — let identity check on next render decide
    };
  }, [idToken, currentUser?.id]);

  if (tokenLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Connecting to Hub...</p>
        </div>
      </div>
    );

  return (
    <MessagesContext.Provider value={{ onlineUserIds, currentUser, idToken, ably, ablyStatus }}>
      <MessagesLayoutContent
        currentUser={currentUser}
        initialConversations={initialConversations}
        supportConversations={supportConversations}
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
    const convoId = await getOrCreateConversation(userId);
    router.push(`/dashboard/messages/${convoId}`);
  };

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
