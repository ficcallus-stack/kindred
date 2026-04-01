"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { createAblyClient } from "@/lib/ably";
import { getUsers, getConversationMessages, sendMessage, getOrCreateConversation } from "./actions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MapPin, ExternalLink, ShieldCheck, Heart, Search, X } from "lucide-react";

interface MessagesClientProps {
  initialConversations: any[];
  supportConversations: any[];
  currentUser: any;
}

export default function MessagesClient({ initialConversations, supportConversations, currentUser }: MessagesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConvoId = searchParams.get("convoId");

  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [allPotentialUsers, setAllPotentialUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const ably = useRef<any>(null);
  const globalChannel = useRef<any>(null);
  const chatChannel = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Ably & Global Presence
  useEffect(() => {
    if (!currentUser?.id) return;

    const client = createAblyClient(currentUser.id);
    ably.current = client;

    if (client) {
      console.log("[ABLY DEBUG] Initializing Client for ID:", currentUser.id);

      client.connection.on('connected', () => console.log("[ABLY DEBUG] Connection States: CONNECTED"));
      client.connection.on('disconnected', () => console.warn("[ABLY DEBUG] Connection States: DISCONNECTED"));
      client.connection.on('failed', (err) => {
        console.error("[ABLY DEBUG] Connection States: FAILED", err);
        if (err.statusCode) console.error("[ABLY DEBUG] Status Code:", err.statusCode);
        if (err.code) console.error("[ABLY DEBUG] Ably Error Code:", err.code);
      });

      const global = client.channels.get("global:presence");
      globalChannel.current = global;

      global.presence.subscribe("enter", (m: any) => {
        setOnlineUserIds(prev => new Set([...Array.from(prev), m.clientId]));
      });
      global.presence.subscribe("leave", (m: any) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          next.delete(m.clientId);
          return next;
        });
      });
      global.presence.get((err: any, members: any) => {
        if (!err && members) {
          setOnlineUserIds(new Set(members.map((m: any) => m.clientId)));
        }
      });
      global.presence.enter();
    }

    // Fetch initial "Potential" users for discovery
    getUsers().then(setAllPotentialUsers);

    return () => {
      if (globalChannel.current) globalChannel.current.presence.leave();
    };
  }, [currentUser]);

  // Handle Conversation Selection
  useEffect(() => {
    if (selectedConvoId) {
      const found = [...initialConversations, ...supportConversations].find(c => c.id === selectedConvoId);
      if (found) {
        setActiveConvo(found);
        loadMessages(found.id);
      }
    } else {
      setActiveConvo(null);
      setMessages([]);
    }
  }, [selectedConvoId, initialConversations, supportConversations]);

  // Subscribe to Active Conversation
  useEffect(() => {
    if (!activeConvo || !ably.current) return;

    const channel = ably.current.channels.get(`conversation:${activeConvo.id}`);
    chatChannel.current = channel;

    channel.subscribe("message", (msg: any) => {
      if (msg.clientId !== currentUser.id) {
        setMessages(prev => [...prev, { ...msg.data, createdAt: new Date() }]);
      }
    });

    channel.subscribe("typing", (msg: any) => {
      if (msg.clientId !== currentUser.id) {
        setIsTyping(msg.data.isTyping);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [activeConvo, currentUser]);

  const loadMessages = async (id: string) => {
    setIsLoadingMessages(true);
    try {
      const history = await getConversationMessages(id);
      setMessages(history.reverse());
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConvo) return;

    const content = inputValue.trim();
    const tempMsg = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      content,
      createdAt: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMsg]);
    setInputValue("");

    try {
      await sendMessage({ conversationId: activeConvo.id, content });
      chatChannel.current?.publish("message", { senderId: currentUser.id, content });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const startNewChat = async (userId: string) => {
    const convoId = await getOrCreateConversation(userId);
    router.push(`/dashboard/messages?convoId=${convoId}`);
  };

  // Map Link Detector
  const renderMessageContent = (content: string) => {
    const googleMapsRegex = /https?:\/\/(www\.)?google\.com\/maps\/[^\s]+/g;
    const appleMapsRegex = /https?:\/\/maps\.apple\.com\/[^\s]+/g;
    
    const isMap = content.match(googleMapsRegex) || content.match(appleMapsRegex);
    
    if (isMap) {
      return (
        <div className="space-y-3">
          <p>{content.replace(googleMapsRegex, '').replace(appleMapsRegex, '')}</p>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all" onClick={() => window.open(isMap[0], '_blank')}>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
              <MapPin className="text-white" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-sm truncate uppercase tracking-tighter">Shared Location</p>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1 italic">View on Maps</p>
            </div>
            <ExternalLink size={16} className="opacity-40" />
          </div>
        </div>
      );
    }
    return <p>{content}</p>;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const filteredUsers = useMemo(() => {
    return allPotentialUsers.filter(u => {
      const match = u.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const isOnline = onlineUserIds.has(u.id);
      return match;
    }).sort((a, b) => {
      const aOnline = onlineUserIds.has(a.id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b.id) ? 1 : 0;
      return bOnline - aOnline;
    });
  }, [allPotentialUsers, searchQuery, onlineUserIds]);

  return (
    <div className="bg-[#f9f9f9] h-screen flex flex-col font-body text-on-surface overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="font-headline font-extrabold text-xl bg-gradient-to-br from-[#031f41] to-[#1d3557] bg-clip-text text-transparent italic">Kindred Messenger</span>
        </div>
        <div className="flex items-center gap-4">
           {currentUser?.profileImageUrl && (
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10">
               <Image src={currentUser.profileImageUrl} alt="Me" width={40} height={40} />
             </div>
           )}
        </div>
      </header>

      <main className="pt-[76px] flex h-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col bg-[#eeeeee] border-r border-[#e2e2e2] h-full transition-all">
          <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
            <div>
              <h1 className="font-headline font-bold text-2xl text-[#031f41] tracking-tighter italic">Messages</h1>
              <div className="mt-4 relative">
                <input 
                  className="w-full bg-white border border-[#c4c6cf]/15 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-primary/40 focus:border-primary/40 placeholder:text-on-surface-variant font-medium shadow-sm transition-all"
                  placeholder="Search and discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
              </div>
            </div>

            {/* Support Sticky */}
            <div 
              className="bg-gradient-to-br from-[#031f41] to-[#1d3557] p-4 rounded-[1.5rem_0.75rem_1.5rem_0.75rem] shadow-lg shadow-primary/10 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group shrink-0"
              onClick={() => startNewChat('kindred-support')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <ShieldCheck className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <span className="text-white font-headline font-bold text-sm block tracking-tighter">Kindred Support</span>
                  <span className="text-[#879ec6] text-[10px] uppercase font-black tracking-tighter italic animate-pulse">Online Experts</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-[#44474e] mb-4 px-1 mt-2">Active Presence</h3>
              <div className="space-y-3 pb-8">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer group",
                      selectedConvoId === user.id ? "bg-white shadow-md shadow-primary/5" : "hover:bg-white/50"
                    )}
                    onClick={() => startNewChat(user.id)}
                  >
                    <div className="relative">
                      {user.profileImageUrl ? (
                        <Image src={user.profileImageUrl} alt={user.fullName} width={48} height={48} className="rounded-[20%_40%_20%_40%/40%_20%_40%_20%] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                      ) : (
                        <div className="w-12 h-12 rounded-[20%_40%_20%_40%/40%_20%_40%_20%] bg-primary/5 border border-primary/5 flex items-center justify-center font-bold text-primary">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                      {onlineUserIds.has(user.id) && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#eeeeee] rounded-full shadow-sm"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-headline font-bold text-sm truncate text-[#1a1c1c] tracking-tight">{user.fullName}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 italic opacity-40">
                         {onlineUserIds.has(user.id) ? "Online Now" : (user.role === 'caregiver' ? 'Elite Nanny' : 'Family Member')}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <header className="px-8 py-5 flex items-center justify-between border-b border-[#eeeeee] shadow-sm z-10 bg-white/60 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-[20%_40%_20%_40%/40%_20%_40%_20%] bg-[#031f41]/5 flex items-center justify-center text-xl font-bold italic text-[#031f41]">
                      {activeConvo.otherMember?.fullName.charAt(0) || "?"}
                    </div>
                    {onlineUserIds.has(activeConvo.otherMember?.id) && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-headline font-extrabold text-xl leading-tight tracking-tighter italic text-[#031f41]">{activeConvo.otherMember?.fullName || "Chat"}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("w-2 h-2 rounded-full", onlineUserIds.has(activeConvo.otherMember?.id) ? "bg-emerald-500" : "bg-slate-300")}></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#44474e]/60 italic">
                        {onlineUserIds.has(activeConvo.otherMember?.id) ? "Live Presence" : "Last Active Moments Ago"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-5 py-2 bg-[#eeeeee] rounded-xl text-[#031f41] font-headline font-bold text-xs hover:bg-[#e8e8e8] transition-colors shadow-sm italic uppercase tracking-widest">Profile</button>
                  <button className="p-2.5 bg-surface-container rounded-xl text-primary" onClick={() => router.push('/dashboard/messages')}><X size={18} /></button>
                </div>
              </header>

              {/* Message Feed */}
              <ScrollArea className="flex-1 p-8 h-full bg-[#f3f3f3]/50 relative">
                 <div className="max-w-4xl mx-auto space-y-8 pb-10">
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div key={idx} className={cn("flex items-end gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                          <div className={cn(
                            "max-w-[75%] p-5 shadow-lg shadow-black/5 transition-all",
                            isMe 
                              ? "bg-gradient-to-br from-[#031f41] to-[#1d3557] text-white rounded-[1.5rem_1.5rem_0.25rem_1.5rem] italic font-medium" 
                              : "bg-white text-[#1a1c1c] rounded-[1.5rem_1.5rem_1.5rem_0.25rem] font-medium border border-black/5"
                          )}>
                             {renderMessageContent(msg.content)}
                             <div className={cn("text-[10px] mt-2 font-black uppercase tracking-widest italic opacity-50 text-right", isMe ? "text-white/70" : "text-slate-400")}>
                               {format(new Date(msg.createdAt), "HH:mm")}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-[#44474e] italic text-xs animate-pulse font-bold tracking-tighter uppercase">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full delay-150"></span>
                        </div>
                        Kindred connection typing...
                      </div>
                    )}
                    <div ref={scrollRef} />
                 </div>
              </ScrollArea>

              {/* Chat Input */}
              <footer className="p-6 bg-white border-t border-[#eeeeee] shrink-0 sticky bottom-0">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[#f3f3f3] rounded-3xl p-2 focus-within:ring-4 ring-primary/5 transition-all shadow-inner border border-black/5">
                  <button className="material-symbols-outlined text-[#44474e] hover:text-[#031f41] p-2 transition-colors">add_circle</button>
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-4 px-2 font-medium italic placeholder:opacity-40" 
                    placeholder="Whisper your message..." 
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      chatChannel.current?.publish("typing", { isTyping: true });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="w-14 h-14 bg-gradient-to-br from-[#031f41] to-[#1d3557] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all group"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
              <div className="w-32 h-32 bg-[#eeeeee] rounded-[30%_60%_30%_60%/60%_30%_60%_30%] flex items-center justify-center mb-8 relative">
                 <MaterialIcon name="auto_awesome" className="text-5xl text-[#031f41] animate-pulse" fill />
              </div>
              <h2 className="text-4xl font-headline font-black text-[#031f41] tracking-tighter italic leading-none">Curated Connection</h2>
              <p className="text-on-surface-variant font-bold max-w-sm mt-6 opacity-60 italic leading-relaxed uppercase tracking-widest text-[11px]">
                Select a verified professional or family member from the sidebar to begin your premium care dialogue.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
