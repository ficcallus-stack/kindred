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
import { Loader2, Send, MapPin, ExternalLink, ShieldCheck, Heart, Search, X, Plus, Image as ImageIcon, Video, FileText, LayoutDashboard, MessageSquare, LifeBuoy, MoreVertical, Paperclip } from "lucide-react";
import { RichMessage } from "@/components/dashboard/RichMessage";
import { getPublicR2Url } from "@/lib/r2";
import { updateUserActive } from "./actions";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'support'>('all');

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
        if (err.reason?.statusCode) console.error("[ABLY DEBUG] Status Code:", err.reason.statusCode);
        if (err.reason?.code) console.error("[ABLY DEBUG] Ably Error Code:", err.reason.code);
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
      global.presence.get()
        .then((members: any) => {
          if (members) {
            setOnlineUserIds(new Set(members.map((m: any) => m.clientId)));
          }
        })
        .catch((err: any) => console.error("[ABLY DEBUG] Presence Get Error:", err));
      
      global.presence.enter();
    }

    // Fetch initial "Potential" users for discovery
    getUsers().then(setAllPotentialUsers);

    return () => {
      const global = globalChannel.current;
      const client = ably.current;

      // Nullify immediately to prevent async logic using it
      globalChannel.current = null;
      ably.current = null;

      if (global) {
        try {
          if (global.state === 'attached') {
            global.presence.leave();
          }
          global.unsubscribe();
          global.detach();
        } catch (e) {
          console.warn("[ABLY CLEANUP] Global Presence Error (Safe to ignore):", e);
        }
      }
      if (client) {
        try {
          client.close();
        } catch (e) {
          console.warn("[ABLY CLEANUP] Client Close Error:", e);
        }
      }
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

  useEffect(() => {
    // 1. Initial update
    updateUserActive().catch(console.error);

    // 2. 5-min heartbeat
    const interval = setInterval(() => {
      updateUserActive().catch(console.error);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (fileData?: any) => {
    if (!inputValue.trim() && !fileData && !activeConvo) return;

    const content = inputValue.trim();
    const tempMsg = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      content: content || (fileData ? `Sent a ${fileData.fileType}` : ""),
      fileUrl: fileData?.fileUrl,
      fileType: fileData?.fileType,
      fileName: fileData?.fileName,
      createdAt: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMsg]);
    if (!fileData) setInputValue("");

    try {
      await sendMessage({ 
        conversationId: activeConvo.id, 
        content: content || undefined,
        fileUrl: fileData?.fileUrl,
        fileType: fileData?.fileType,
        fileName: fileData?.fileName
      });
      chatChannel.current?.publish("message", { 
        senderId: currentUser.id, 
        content: content || undefined,
        fileUrl: fileData?.fileUrl,
        fileType: fileData?.fileType,
        fileName: fileData?.fileName
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvo) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const { uploadUrl, key } = await res.json();

      setUploadProgress(40);
      
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (!uploadRes.ok) throw new Error("Upload to R2 failed");

      setUploadProgress(90);
      const publicUrl = getPublicR2Url(key);
      
      await handleSendMessage({
        fileUrl: publicUrl,
        fileType: file.type.split('/')[0], // image, video, or stay specific
        fileName: file.name
      });

    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 overflow-hidden">
      {/* 1. Global Navigation Rail */}
      <nav className="w-20 bg-[#031f41] flex flex-col items-center py-8 gap-8 shrink-0">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
           <Heart className="text-white fill-white" size={24} />
        </div>
        
        <button className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-colors" title="Dashboard">
          <LayoutDashboard size={24} />
        </button>
        <button className="p-3 rounded-2xl bg-white text-[#031f41] shadow-xl shadow-blue-900/40" title="Messages">
          <MessageSquare size={24} />
        </button>
        <button 
          className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-colors mt-auto" 
          title="Kindred Support"
          onClick={() => startNewChat('kindred-support')}
        >
          <LifeBuoy size={24} />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border border-white/10">
          {currentUser?.profileImageUrl && <Image src={currentUser.profileImageUrl} alt="Avatar" width={40} height={40} />}
        </div>
      </nav>

      {/* 2. Conversations Sidebar */}
      <aside className={cn(
        "w-full md:w-[380px] bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative z-20",
        sidebarOpen ? "ml-0" : "-ml-[380px]"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black font-headline tracking-tighter text-[#031f41]">Messages</h1>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
              <button 
                onClick={() => setCurrentTab('all')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", currentTab === 'all' ? "bg-white text-[#031f41] shadow-sm" : "text-slate-400")}
              >All</button>
              <button 
                onClick={() => setCurrentTab('support')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", currentTab === 'support' ? "bg-white text-[#031f41] shadow-sm" : "text-slate-400")}
              >Support</button>
            </div>
          </div>

          <div className="relative group">
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 ring-blue-500/10 placeholder:text-slate-400 transition-all"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-20">
            {currentTab === 'all' ? (
              <>
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400/60">Recent Conversations</div>
                {(filteredUsers.length > 0 ? filteredUsers : []).map(user => (
                  <button 
                    key={user.id}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative",
                      selectedConvoId?.includes(user.id) ? "bg-blue-50/50" : "hover:bg-slate-50"
                    )}
                    onClick={() => startNewChat(user.id)}
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm bg-slate-200">
                        {user.profileImageUrl ? (
                          <Image src={user.profileImageUrl} alt={user.fullName} width={56} height={56} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg uppercase">{user.fullName.charAt(0)}</div>
                        )}
                      </div>
                      {onlineUserIds.has(user.id) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-[15px] truncate text-slate-900">{user.fullName}</span>
                        <span className="text-[10px] text-slate-400">{(() => {
                          const convo = initialConversations.find((c: any) => c.otherMember?.id === user.id);
                          if (!convo?.updatedAt || new Date(convo.updatedAt).getTime() === 0) return 'New';
                          const d = new Date(convo.updatedAt);
                          const now = new Date();
                          const diffMs = now.getTime() - d.getTime();
                          if (diffMs < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          if (diffMs < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
                          return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        })()}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium group-hover:text-slate-900 transition-colors">
                        {onlineUserIds.has(user.id) ? "Active now" : (user.role === 'caregiver' ? 'Elite Nanny' : 'Family Account')}
                      </p>
                    </div>
                    {selectedConvoId?.includes(user.id) && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#031f41] rounded-l-full"></div>
                    )}
                  </button>
                ))}
              </>
            ) : (
              /* Support Tab */
              <div 
                className="mx-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-500/10 cursor-pointer overflow-hidden relative group"
                onClick={() => startNewChat('kindred-support')}
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                     <ShieldCheck className="text-white" size={24} />
                  </div>
                  <h3 className="text-white font-black font-headline text-lg italic tracking-tighter leading-tight">Trust & Safety<br/>Support Chat</h3>
                  <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-4 opacity-80">Online 24/7 • Secure</p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* 3. Main Chat View */}
      <main className="flex-1 flex flex-col bg-white relative">
        {activeConvo ? (
          <>
            {/* Elegant Header */}
            <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 text-slate-400"
                ><MoreVertical size={20}/></button>
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#031f41] italic overflow-hidden">
                    {activeConvo.otherMember?.profileImageUrl ? (
                       <img src={activeConvo.otherMember.profileImageUrl} className="w-full h-full object-cover" />
                    ) : (
                       activeConvo.otherMember?.fullName.charAt(0) || "?"
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 leading-none flex items-center gap-2">
                    {activeConvo.isSupport ? "Kindred Safety Support" : activeConvo.otherMember?.fullName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    {onlineUserIds.has(activeConvo.otherMember?.id) || activeConvo.isSupport ? (
                      <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">
                          {activeConvo.isSupport 
                            ? (activeConvo.moderatorName ? `Talking to Moderator ${activeConvo.moderatorName}` : "Waiting for Mod...") 
                            : "Live Now"}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Offline</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => window.open(`/nannies/${activeConvo?.otherMember?.id || activeConvo?.id}`, '_blank')} className="px-5 py-2.5 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">View Profile</button>
                <button className="p-2.5 text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
              </div>
            </header>

            {/* Premium Message Feed */}
            <ScrollArea className="flex-1 bg-slate-50/30">
              <div className="max-w-4xl mx-auto p-8 flex flex-col gap-6">
                 {messages.map((msg, idx) => (
                   <RichMessage 
                    key={msg.id || idx} 
                    message={msg} 
                    isMe={msg.senderId === currentUser.id} 
                   />
                 ))}
                 
                 {isTyping && (
                  <div className="flex items-center gap-3 text-blue-500/60 pl-2">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-200"></span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Someone is typing...</span>
                  </div>
                 )}
                 <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Smart Input Bar */}
            <footer className="p-8 bg-white border-t border-slate-50">
              <div className="max-w-4xl mx-auto relative">
                {isUploading && (
                  <div className="absolute -top-12 left-0 right-0 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-100 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{uploadProgress}% Uploading...</span>
                  </div>
                )}
                
                <div className="bg-slate-50 rounded-[28px] p-2 flex items-center gap-2 focus-within:ring-4 ring-blue-500/5 transition-all shadow-sm border border-slate-100/50">
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-[#031f41] hover:bg-white transition-all overflow-hidden"
                  >
                    <Plus size={24} />
                  </button>
                  
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 font-medium placeholder:text-slate-400" 
                    placeholder={activeConvo.isSupport ? "Describe your issue to Kindred Support..." : "Send a message..."}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      chatChannel.current?.publish("typing", { isTyping: true });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  
                  <button 
                    className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300",
                      inputValue.trim() ? "bg-[#031f41] text-white shadow-lg shadow-blue-900/20 scale-100 hover:scale-105" : "bg-slate-200 text-slate-400 scale-90 opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[35%] flex items-center justify-center mb-8 rotate-12">
               <MessageSquare className="text-slate-200" size={48} />
            </div>
            <h2 className="text-3xl font-black font-headline text-[#031f41] tracking-tighter italic">Kindred Connect</h2>
            <p className="mt-4 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] max-w-xs leading-loose">
              Select a secure thread from the sidebar to engage in a verified dialogue.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
