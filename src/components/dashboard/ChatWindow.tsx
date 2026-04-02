"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { sendMessage, uploadMessageAttachment, checkChatAccess, createChatUnlockSession } from "@/app/dashboard/messages/actions";
import { ChatPaywallGate } from "./ChatPaywallGate";
import Image from "next/image";
import { format } from "date-fns";
import { createAblyClient } from "@/lib/ably";
import { 
  Send, Loader2, Paperclip, X, Image as ImageIcon, 
  Maximize2, CheckCheck, Wifi, WifiOff, Globe, AlertCircle, Search,
  FileText, Film, File
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

interface ChatWindowProps {
  conversationId: string;
  initialMessages: any[];
  currentUser: any;
  otherMember?: any;
  isSupport?: boolean;
}

type MessageStatus = 'sending' | 'sent' | 'error';

type AppMessage = {
  id: string;
  senderId: string;
  content: string;
  imageUrls?: string[];
  type: 'text' | 'image';
  createdAt: number;
  status?: MessageStatus;
  error?: string;
};

export function ChatWindow({ 
  conversationId, 
  initialMessages, 
  currentUser, 
  otherMember,
  isSupport = false 
}: ChatWindowProps) {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<AppMessage[]>(
    initialMessages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      imageUrls: m.fileUrl ? [m.fileUrl] : [],
      type: m.fileUrl ? 'image' : 'text',
      createdAt: new Date(m.createdAt).getTime(),
      status: 'sent'
    }))
  );
  
  const [inputText, setInputText] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerPresent, setIsPartnerPresent] = useState(false);
  const [connectionState, setConnectionState] = useState('initialized');
  const [error, setError] = useState<string | null>(null);
  
  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ably = useRef<any>(null);
  const chatChannel = useRef<any>(null);

  // 1. Access Check
  useEffect(() => {
    async function verifyAccess() {
      if (isSupport || currentUser.role === "moderator") {
        setHasAccess(true);
        return;
      }
      if (!otherMember?.id) return;
      const res = await checkChatAccess(otherMember.id);
      setHasAccess(res.hasAccess);
    }
    verifyAccess();
  }, [conversationId, otherMember, isSupport]);

  // 2. Ably Realtime Setup with Token Injection (Fixing Disconnection)
  useEffect(() => {
    if (!currentUser || hasAccess === false || !firebaseUser) return;
    
    let isMounted = true;

    async function initAbly() {
      try {
        const idToken = await firebaseUser!.getIdToken();
        if (!isMounted) return;

        const client = createAblyClient(currentUser.id, idToken);
        if (!client) return;

        ably.current = client;

        client.connection.on('connected', () => isMounted && setConnectionState('connected'));
        client.connection.on('connecting', () => isMounted && setConnectionState('connecting'));
        client.connection.on('disconnected', () => isMounted && setConnectionState('disconnected'));
        client.connection.on('failed', (err) => {
          console.error("[ABLY CLIENT] Fatal Error:", err);
          if (isMounted) setError(err.reason?.message || "Connection failed");
        });

        const channelName = `conversation:${conversationId}`;
        const channel = client.channels.get(channelName);
        chatChannel.current = channel;

        // Subscribe to Messages
        channel.subscribe('message', (msg: any) => {
          if (isMounted && msg.clientId !== currentUser.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.data.id)) return prev;
              return [...prev, { ...msg.data, createdAt: msg.data.timestamp || Date.now(), status: 'sent' }];
            });
          }
        });

        // Subscribe to Typing
        channel.subscribe('typing', (msg: any) => {
          if (isMounted && msg.clientId !== currentUser.id) setIsPartnerTyping(msg.data.isTyping);
        });

        // Presence
        if (otherMember?.id) {
          channel.presence.subscribe('enter', (m: any) => {
            if (m.clientId === otherMember.id && isMounted) setIsPartnerPresent(true);
          });
          channel.presence.subscribe('leave', (m: any) => {
            if (m.clientId === otherMember.id && isMounted) setIsPartnerPresent(false);
          });
          channel.presence.get()
            .then((members: any) => {
              if (members && isMounted) {
                setIsPartnerPresent(members.some((m: any) => m.clientId === otherMember.id));
              }
            })
            .catch((err: any) => console.warn("[ABLY] Presence Get Error:", err));

          // Simply enter presence. Ably handles the attachment internally.
          // This is safer than adding manual 'on(attached)' listeners that leak.
          try {
            channel.presence.enter();
          } catch (e) {
            console.warn("[ABLY] Presence Enter Error:", e);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Ably Init Failed:", err);
          setError(err.message);
        }
      }
    }

    initAbly();

    return () => {
      isMounted = false;
      const channel = chatChannel.current;

      // Nullify references so async callbacks don't fire on unmounted components
      chatChannel.current = null;
      ably.current = null;

      if (channel) {
        try {
          channel.unsubscribe();
          // Detach specifically this conversation's channel
          if (channel.state === 'attached' || channel.state === 'attaching') {
             channel.detach();
          }
        } catch (e) {
          console.warn("[ABLY CLEANUP] Channel Detach Error:", e);
        }
      }
    };
  }, [currentUser, conversationId, hasAccess, otherMember, firebaseUser]);

  // 3. Message Handlers
  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatChannel.current) return;

    const tempId = Math.random().toString(36).slice(2);
    const text = inputText.trim();
    const msg: AppMessage = {
      id: tempId,
      senderId: currentUser.id,
      content: text,
      type: 'text',
      createdAt: Date.now(),
      status: 'sending'
    };

    setMessages(prev => [...prev, msg]);
    setInputText("");
    sendTypingStatus(false);

    try {
      await sendMessage({ conversationId, content: text });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m));
    } catch (err: any) {
      setError(err.message);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    }
  };

  const handleSendImages = async () => {
    if (selectedFiles.length === 0 || !chatChannel.current) return;

    const tempId = Math.random().toString(36).slice(2);
    const optimisticMsg: AppMessage = {
      id: tempId,
      senderId: currentUser.id,
      content: "Shared images",
      imageUrls: previewUrls,
      type: 'image',
      createdAt: Date.now(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMsg]);
    // No modal trigger, images appear in the strip

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadMessageAttachment(formData);
      });

      const urls = await Promise.all(uploadPromises);

      // Save first image to DB (aligning with server's fileUrl property)
      await sendMessage({ conversationId, content: "Shared images", fileUrl: urls[0] });

      const finalMsg: AppMessage = {
        ...optimisticMsg,
        imageUrls: urls,
        status: 'sent'
      };

      setMessages(prev => prev.map(m => m.id === tempId ? finalMsg : m));
    } catch (err: any) {
      setError(err.message);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    } finally {
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (chatChannel.current) chatChannel.current.publish('typing', { isTyping });
  };

  const handleInputUpdate = (val: string) => {
    setInputText(val);
    sendTypingStatus(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => sendTypingStatus(false), 2000));
  };

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      console.log("[ChatWindow] Initial selection:", files.map(f => `${f.name} (${(f.size/1024/1024).toFixed(2)}MB)`));

      if (files.length === 0) return;

      const MAX_SIZE = 25 * 1024 * 1024; // 25MB
      const tooLarge = files.filter(f => f.size > MAX_SIZE);
      const valid = files.filter(f => f.size <= MAX_SIZE);

      if (tooLarge.length > 0) {
        setError(`Limit: 25MB. Too large: ${tooLarge.map(f => f.name).join(", ")}`);
      }

      if (valid.length > 0) {
        setSelectedFiles(prev => [...prev, ...valid].slice(0, 8));
        setPreviewUrls(prev => [...prev, ...valid.map(f => {
          if (f.type.startsWith('image/')) return URL.createObjectURL(f);
          return "file_placeholder"; // Non-image indicator
        })].slice(0, 8));
      }
    } catch (err: any) {
      console.error("[ChatWindow] Selection Error:", err);
      setError("Failed to process selection. Try a standard image format.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleUnlock = async () => {
    if (!otherMember?.id) return;
    const { url } = await createChatUnlockSession(otherMember.id);
    if (url) window.location.href = url;
  };

  // 4. Auto-Scroll Logic: User requested to STOP forced scrolling
  // We only scroll to bottom if the user is already very close to the bottom
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // Only force scroll if they were already at the bottom or if IT'S THEIR OWN MESSAGE
      // Actually, user said STOP it completely. I'll comment it out or make it very subtle.
      /*
      if (isAtBottom) {
         scrollRef.current.scrollTop = scrollHeight;
      }
      */
    }
  }, [messages, isPartnerTyping]);

  return (
    <section className="flex-1 flex flex-col bg-[#f0f2f5] relative overflow-hidden font-body">
      {/* WA Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://pub-d33c13728d81440088421e0298b11617.r2.dev/wa-bg.png')] bg-repeat"></div>

      {/* Main Feed */}
      <div className="flex-1 relative overflow-hidden">
        {hasAccess === false ? (
          <ChatPaywallGate nannyName={otherMember?.fullName || "Caregiver"} onUnlock={handleUnlock} />
        ) : hasAccess === true ? (
           <ScrollArea className="h-full px-6 py-8 relative z-10" ref={scrollRef}>
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                 <div className="flex justify-center mb-10">
                    <span className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
                       Secure Intelligence Feed • {connectionState}
                    </span>
                 </div>

                 {messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={i} className={cn("flex animate-in fade-in duration-500", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "relative group max-w-[80%] transition-all",
                          msg.type === 'image' ? "w-full max-w-[450px]" : "px-6 py-4 rounded-[1.5rem] shadow-sm",
                          isMe 
                            ? (msg.type === 'image' ? "" : "bg-primary text-white rounded-br-none") 
                            : "bg-white text-blue-900 border border-slate-100 rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        )}>
                          {msg.type === 'image' ? (
                            <div className="space-y-3">
                               <div className={cn(
                                 "grid gap-2 overflow-hidden rounded-[2.5rem] shadow-2xl bg-black/5 w-full border-4 border-white transform transition-transform group-hover:scale-[1.02]",
                                 msg.imageUrls?.length === 1 ? "grid-cols-1" : "grid-cols-2"
                               )}>
                                 {msg.imageUrls?.map((url, idx) => (
                                   <div 
                                     key={idx} 
                                     onClick={() => setFullscreenImage(url)}
                                     className="relative aspect-square cursor-pointer hover:opacity-90 transition-all overflow-hidden"
                                   >
                                      <Image src={url} alt="Shared" fill className="object-cover" />
                                      {msg.status === 'sending' && (
                                        <div className="absolute inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center">
                                           <Loader2 className="animate-spin text-white" />
                                        </div>
                                      )}
                                   </div>
                                 ))}
                               </div>
                               <div className="flex items-center justify-end gap-2 px-4">
                                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{format(msg.createdAt, 'HH:mm')}</span>
                                  {isMe && <CheckCheck size={16} className={msg.status === 'sent' ? "text-emerald-500" : "text-slate-300"} />}
                               </div>
                            </div>
                          ) : (
                            <div>
                               <p className="text-[14px] leading-relaxed font-bold italic tracking-tight">{msg.content}</p>
                               <div className="flex items-center justify-end gap-2 mt-2">
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest", isMe ? "text-white/60" : "text-slate-300")}>
                                     {format(msg.createdAt, 'HH:mm')}
                                  </span>
                                  {isMe && <CheckCheck size={14} className={msg.status === 'sent' ? (isMe ? "text-white" : "text-emerald-500") : "text-white/30"} />}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                 })}
              </div>
           </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
             <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}
      </div>

      {/* Preview Strip - Force Visible */}
      {selectedFiles.length > 0 && (
         <div className="px-6 py-6 bg-white border-t-4 border-primary/20 flex items-center gap-6 relative z-50 shadow-[0_-20px_50px_rgba(37,99,235,0.1)]">
            <div className="flex-1 flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
              {previewUrls.map((url, idx) => {
                 const file = selectedFiles[idx];
                 const isImage = file?.type.startsWith('image/');
                 const isVideo = file?.type.startsWith('video/');

                 return (
                    <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white transform hover:scale-105 transition-all group shrink-0 bg-slate-100 flex items-center justify-center">
                       {isImage ? (
                          <img 
                            src={url} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                       ) : (
                          <div className="flex flex-col items-center gap-2 p-2">
                             {isVideo ? <Film className="text-blue-500" size={32} /> : <FileText className="text-slate-400" size={32} />}
                             <span className="text-[8px] font-black uppercase text-slate-500 truncate w-24 text-center line-clamp-1">{file?.name}</span>
                          </div>
                       )}
                       <button 
                          onClick={() => {
                             const nf = [...selectedFiles]; nf.splice(idx,1); setSelectedFiles(nf);
                             const nu = [...previewUrls]; nu.splice(idx,1); setPreviewUrls(nu);
                             if (url !== "file_placeholder") URL.revokeObjectURL(url);
                          }}
                          className="absolute top-1 right-1 w-8 h-8 bg-black/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                       >
                          <X size={14} />
                       </button>
                    </div>
                 );
              })}
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic leading-none">{selectedFiles.length} Selections</span>
               <button 
                  onClick={() => { setSelectedFiles([]); setPreviewUrls([]); }}
                  className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
               >
                  Clear All
               </button>
            </div>
            {inputText.trim() === "" && (
              <Button 
                onClick={handleSendImages}
                className="h-14 px-8 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all font-headline italic"
              >
                Send {selectedFiles.length} Items
              </Button>
            )}
         </div>
       )}

      {hasAccess === true && (
        <footer className="p-6 bg-white shrink-0 z-20 flex items-center gap-4 border-t border-slate-100 shadow-[0_-8px_40px_rgba(37,99,235,0.05)]">
           <input 
             type="file" 
             multiple 
             accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={onFileSelect} 
           />
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-12 w-12 rounded-2xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-all active:scale-95"
             onClick={() => fileInputRef.current?.click()}
           >
             <Paperclip size={20} />
           </Button>

           <div className="flex-1 bg-slate-50 rounded-[1.5rem] px-6 py-1 border border-slate-200 focus-within:border-primary/20 focus-within:bg-white transition-all">
              <Input 
                value={inputText}
                onChange={(e) => handleInputUpdate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a secure intelligence report..."
                className="bg-transparent border-none focus-visible:ring-0 text-[14px] font-black italic h-12 px-0 text-blue-950 tracking-tight"
              />
           </div>

           <Button 
             onClick={handleSendMessage}
             disabled={!inputText.trim()}
             className="h-12 w-12 rounded-[1.5rem] bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center p-0"
           >
             <Send size={20} className="ml-1" />
           </Button>
        </footer>
      )}

      {/* Modals */}
      {/* Image Fullscreen Preview */}

      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[98vw] h-[95vh] bg-black/90 backdrop-blur-xl border-none shadow-none p-0 flex items-center justify-center rounded-[2rem]">
           {fullscreenImage && (
             <div className="relative w-full h-full flex items-center justify-center p-12">
               <Image src={fullscreenImage} alt="Large" fill className="object-contain" priority />
               <button onClick={() => setFullscreenImage(null)} className="absolute top-8 right-8 p-6 text-white bg-white/10 hover:bg-white/25 rounded-full transition-all">
                  <X size={48} />
               </button>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
