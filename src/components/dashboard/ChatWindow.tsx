"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { sendMessage, uploadMessageAttachment, checkChatAccess, createChatUnlockSession } from "@/app/dashboard/messages/actions";
import { ChatPaywallGate } from "./ChatPaywallGate";
import Image from "next/image";
import { format } from "date-fns";
import { createAblyClient } from "@/lib/ably";
import { 
  Send, Loader2, Paperclip, X, Image as ImageIcon, 
  Maximize2, CheckCheck, Wifi, WifiOff, Globe, AlertCircle, Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [messages, setMessages] = useState<AppMessage[]>(
    initialMessages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      imageUrls: m.imageUrl ? [m.imageUrl] : [],
      type: m.imageUrl ? 'image' : 'text',
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  // 2. Ably Realtime Setup
  useEffect(() => {
    if (!currentUser || hasAccess === false) return;
    
    const client = createAblyClient(currentUser.id);
    ably.current = client;

    if (client) {
      client.connection.on('connected', () => setConnectionState('connected'));
      client.connection.on('connecting', () => setConnectionState('connecting'));
      client.connection.on('disconnected', () => setConnectionState('disconnected'));
      client.connect();

      const channelName = `conversation:${conversationId}`;
      chatChannel.current = client.channels.get(channelName);

      // Subscribe to Messages
      chatChannel.current.subscribe('message', (msg: any) => {
        if (msg.clientId !== currentUser.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.data.id)) return prev;
            return [...prev, { ...msg.data, createdAt: msg.data.timestamp || Date.now(), status: 'sent' }];
          });
        }
      });

      // Subscribe to Typing
      chatChannel.current.subscribe('typing', (msg: any) => {
        if (msg.clientId !== currentUser.id) setIsPartnerTyping(msg.data.isTyping);
      });

      // Presence
      if (otherMember?.id) {
        chatChannel.current.presence.subscribe('enter', (m: any) => {
          if (m.clientId === otherMember.id) setIsPartnerPresent(true);
        });
        chatChannel.current.presence.subscribe('leave', (m: any) => {
          if (m.clientId === otherMember.id) setIsPartnerPresent(false);
        });
        chatChannel.current.presence.get((err: any, members: any) => {
          if (!err && members) {
            setIsPartnerPresent(members.some((m: any) => m.clientId === otherMember.id));
          }
        });
      }

      chatChannel.current.presence.enter();
    }

    return () => {
      if (chatChannel.current) {
        chatChannel.current.presence.leave();
        chatChannel.current.unsubscribe();
      }
      if (ably.current) ably.current.close();
    };
  }, [currentUser, conversationId, hasAccess, otherMember]);

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
      chatChannel.current.publish('message', { ...msg, status: 'sent', timestamp: Date.now() });
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
    setIsPreviewOpen(false);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadMessageAttachment(formData);
      });

      const urls = await Promise.all(uploadPromises);

      // Save first image to DB (schema limitation to 1 per message record)
      await sendMessage({ conversationId, content: "Shared images", imageUrl: urls[0] });

      const finalMsg: AppMessage = {
        ...optimisticMsg,
        imageUrls: urls,
        status: 'sent'
      };

      setMessages(prev => prev.map(m => m.id === tempId ? finalMsg : m));
      chatChannel.current.publish('message', { ...finalMsg, status: 'sent', timestamp: Date.now() });
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

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (files.length > 0) {
      const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
      setSelectedFiles(valid);
      setPreviewUrls(valid.map(f => URL.createObjectURL(f)));
      setIsPreviewOpen(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUnlock = async () => {
    if (!otherMember?.id) return;
    const { url } = await createChatUnlockSession(otherMember.id);
    if (url) window.location.href = url;
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isPartnerTyping]);

  return (
    <section className="flex-1 flex flex-col bg-[#e5ddd5] relative overflow-hidden font-body">
      {/* WA Pattern Overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://pub-d33c13728d81440088421e0298b11617.r2.dev/wa-bg.png')] bg-repeat"></div>

      {/* Header */}
      <div className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary border border-outline-variant/10 relative">
             {otherMember?.fullName?.charAt(0) || (isSupport ? "S" : "?")}
             {isPartnerPresent && (
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white transition-all scale-100"></div>
             )}
          </div>
          <div>
            <h1 className="font-headline text-lg font-black text-primary tracking-tight leading-none italic uppercase">
               {otherMember?.fullName || (isSupport ? "KindredCare Support" : "Secure Room")}
            </h1>
            <p className={cn(
              "text-[10px] uppercase font-black tracking-widest mt-1.5 flex items-center gap-2",
              isPartnerTyping ? "text-primary animate-pulse" : (isPartnerPresent ? "text-emerald-600" : "text-slate-400")
            )}>
              {isPartnerTyping ? 'Typing...' : (isPartnerPresent ? 'Online Now' : 'Last seen recently')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end opacity-40">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{connectionState}</span>
              <div className="flex gap-1 mt-1 font-black text-[10px]">
                 {connectionState === 'connected' ? <Globe size={11} className="text-emerald-500" /> : <WifiOff size={11} />}
              </div>
           </div>
           <button className="p-2.5 text-slate-400 hover:text-primary transition-all"><Search size={22} /></button>
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 relative overflow-hidden">
        {hasAccess === false ? (
          <ChatPaywallGate nannyName={otherMember?.fullName || "Caregiver"} onUnlock={handleUnlock} />
        ) : hasAccess === true ? (
           <ScrollArea className="h-full px-6 py-8 relative z-10">
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                 <div className="flex justify-center mb-10">
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-100 shadow-sm shadow-amber-900/5">
                       Audit History Enabled • Secured via Ably
                    </span>
                 </div>

                 {messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={i} className={cn("flex animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "relative group max-w-[80%] transition-all",
                          msg.type === 'image' ? "w-full max-w-[450px]" : "px-6 py-4 rounded-[2rem] shadow-sm",
                          isMe ? (msg.type === 'image' ? "" : "bg-primary text-white rounded-br-none") : "bg-white text-blue-900 border border-outline-variant/10 rounded-bl-none"
                        )}>
                          {msg.type === 'image' ? (
                            <div className="space-y-3">
                               <div className={cn(
                                 "grid gap-2 overflow-hidden rounded-[2.5rem] shadow-2xl bg-black/5 w-full border-4 border-white",
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
                               <p className="text-[15px] leading-relaxed font-semibold italic">{msg.content}</p>
                               <div className="flex items-center justify-end gap-2 mt-2">
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest", isMe ? "text-white/60" : "text-slate-400")}>
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
                 <div ref={scrollRef} />
              </div>
           </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
             <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}
      </div>

      {/* Input Overlay */}
      {hasAccess === true && (
        <footer className="p-6 bg-white shrink-0 z-20 flex items-center gap-4 border-t shadow-[0_-8px_40px_rgba(0,0,0,0.04)]">
           <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={onFileSelect} />
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-14 w-14 rounded-3xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95"
             onClick={() => fileInputRef.current?.click()}
           >
             <Paperclip size={24} />
           </Button>

           <div className="flex-1 bg-slate-100 rounded-[2rem] px-8 py-1 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner">
              <Input 
                value={inputText}
                onChange={(e) => handleInputUpdate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Compose a secure message..."
                className="bg-transparent border-none focus-visible:ring-0 text-[15px] font-black italic h-14 px-0 text-primary tracking-tight"
              />
           </div>

           <Button 
             onClick={handleSendMessage}
             disabled={!inputText.trim()}
             className="h-14 w-14 rounded-[2rem] bg-primary text-white hover:scale-110 active:scale-90 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center p-0"
           >
             <Send size={24} className="ml-1" />
           </Button>
        </footer>
      )}

      {/* Modals */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-3xl p-0 border-none overflow-hidden rounded-[4rem] shadow-2xl">
          <div className="bg-primary text-white p-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <ImageIcon size={28} className="text-white/80" />
               <h3 className="text-3xl font-black font-headline italic tracking-tighter uppercase leading-none">Share Photos ({selectedFiles.length})</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="text-white hover:bg-white/20 rounded-full h-12 w-12">
              <X size={28} />
            </Button>
          </div>
          <div className="p-12">
            <ScrollArea className="max-h-[45vh] mb-10">
               <div className="grid grid-cols-2 gap-8 px-2">
                 {previewUrls.map((url, idx) => (
                   <div key={idx} className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl group border-8 border-white group transition-all hover:scale-105 active:rotate-1">
                      <Image src={url} alt="Preview" fill className="object-cover" />
                      <button 
                         onClick={() => {
                            const nf = [...selectedFiles]; nf.splice(idx,1); setSelectedFiles(nf);
                            const nu = [...previewUrls]; nu.splice(idx,1); setPreviewUrls(nu);
                            if (nf.length === 0) setIsPreviewOpen(false);
                         }}
                         className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                      >
                         <X size={20} />
                      </button>
                   </div>
                 ))}
               </div>
            </ScrollArea>
            <div className="flex justify-end gap-6">
               <Button onClick={() => setIsPreviewOpen(false)} variant="ghost" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[11px] opacity-40 hover:opacity-100">Cancel</Button>
               <Button onClick={handleSendImages} className="bg-primary hover:scale-[1.05] active:scale-95 transition-all text-white rounded-[2rem] px-16 h-20 text-xl font-black italic tracking-tighter shadow-[0_20px_40px_rgba(37,99,235,0.3)] uppercase">
                  <Send className="mr-4" /> Finalize & Send
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[98vw] h-[95vh] bg-black/90 backdrop-blur-xl border-none shadow-none p-0 flex items-center justify-center rounded-[4rem]">
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
