"use client";

import { useState, useEffect, useRef } from "react";
import { useAbly } from "@/hooks/useAbly";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { sendMessage, uploadMessageAttachment } from "@/app/dashboard/messages/actions";
import Image from "next/image";

interface ChatWindowProps {
  conversationId: string;
  initialMessages: any[];
  currentUser: any;
  otherMember?: any;
  isSupport?: boolean;
}

export function ChatWindow({ 
  conversationId, 
  initialMessages, 
  currentUser, 
  otherMember,
  isSupport = false 
}: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channelName = `conversation:${conversationId}`;
  const { channel } = useAbly(channelName, (message) => {
    if (message.name === "message") {
      setMessages((prev) => {
        // Swap optimistic message with the identical real server message
        const optimisticIndex = prev.findIndex(m => m.isOptimistic && m.senderId === message.data.senderId && m.content === message.data.content);
        if (optimisticIndex !== -1) {
          const newMsgs = [...prev];
          newMsgs[optimisticIndex] = message.data;
          return newMsgs;
        }
        if (prev.some(m => m.id === message.data.id)) return prev;
        return [...prev, message.data];
      });
    } else if (message.name === "typing") {
      if (message.data?.userId !== currentUser.id) {
        setIsTyping(message.data.isTyping);
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function handleTyping(text: string) {
    setInputText(text);
    if (channel) {
      channel.publish("typing", { isTyping: text.length > 0, userId: currentUser.id });
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearAttachment() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  async function handleSendMessage() {
    if (!inputText.trim() && !selectedFile) return;

    setError(null);
    const textContent = inputText.trim();
    const currentPreviewUrl = previewUrl;
    const currentFile = selectedFile;
    
    // 1. Instantly clear input boxes
    setInputText("");
    clearAttachment();
    if (channel) channel.publish("typing", { isTyping: false, userId: currentUser.id });

    // 2. Build and inject optimistic message directly into UI
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      content: textContent || "Sent an attachment",
      createdAt: new Date().toISOString(),
      senderId: currentUser.id,
      imageUrl: currentPreviewUrl,
      sender: currentUser,
      isOptimistic: true,
      isUploading: !!currentFile
    };

    setMessages(prev => [...prev, optimisticMsg]);

    let imageUrl: string | undefined = undefined;

    try {
      if (currentFile) {
        const formData = new FormData();
        formData.append("file", currentFile);
        imageUrl = await uploadMessageAttachment(formData);
      }

      await sendMessage({ conversationId, content: optimisticMsg.content, imageUrl });
    } catch (err: any) {
      console.error("Failed to send message", err);
      // Erase optimistic message and notify user of failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setError(err.message || "Failed to deliver message. Please try again.");
    }
  }

  return (
    <section className="flex-1 flex flex-col bg-surface overflow-hidden">
      {/* Chat Header */}
      <div className="h-20 border-b border-surface-container flex items-center justify-between px-8 bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-11 h-11 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary border-2 border-white text-sm shadow-sm shrink-0">
              {otherMember?.fullName?.charAt(0) || (isSupport ? "S" : "?")}
            </div>
            {isSupport && (
              <div className="w-11 h-11 rounded-full bg-secondary text-white flex items-center justify-center font-black border-2 border-white text-xs shadow-sm shrink-0">
                KC
              </div>
            )}
          </div>
          <div>
            <h1 className="font-headline font-black text-primary flex items-center gap-2 tracking-tight italic">
              {isSupport && otherMember && (currentUser.role !== "moderator" && currentUser.role !== "admin")
                ? otherMember.fullName.split(' ')[0]
                : otherMember?.fullName || (isSupport ? "KindredCare Support" : "Secure Channel")
              }
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-tertiary-fixed text-on-tertiary-fixed tracking-[0.1em] uppercase">
                SECURE CHANNEL
              </span>
            </h1>
            <p className="text-[10px] text-on-surface-variant flex items-center gap-1.5 font-bold uppercase tracking-widest opacity-60">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active Now • <span className="text-secondary font-black">ABLY POWERED</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-outline-variant/10 group">
            <MaterialIcon name="call" className="text-xl group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-outline-variant/10 group">
            <MaterialIcon name="videocam" className="text-xl group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-outline-variant/10">
            <MaterialIcon name="more_vert" className="text-xl" />
          </button>
        </div>
      </div>

      {isSupport && (
        <div className="px-8 py-3 bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-between border-b border-outline-variant/15 shadow-sm">
          <div className="flex items-center gap-3">
            <MaterialIcon name="verified" className="text-on-tertiary-fixed-variant text-lg" fill />
            <span className="text-xs font-black uppercase tracking-widest">
              {currentUser.role !== "moderator" && currentUser.role !== "admin" 
                ? "You are speaking with a Verified Support Moderator"
                : "Official Support Session Active"
              }
            </span>
          </div>
          <div className="text-[9px] uppercase font-black tracking-[0.2em] opacity-40">Session ID: KC-REALTIME-{conversationId.slice(0,4)}</div>
        </div>
      )}

      {/* Messages Window */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-surface-container-low/30 selection:bg-primary/10"
      >
        <div className="flex justify-center pb-4">
          <span className="px-5 py-2 rounded-full bg-white text-[10px] font-black text-on-surface-variant tracking-[0.2em] uppercase shadow-sm border border-outline-variant/5 ring-4 ring-slate-50">
            Secure Session Started
          </span>
        </div>

        {messages.map((msg: any) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-4 max-w-2xl group animate-in slide-in-from-bottom-2 duration-300",
                isMe ? "ml-auto flex-row-reverse" : "",
                msg.isOptimistic ? "opacity-90 grayscale-[20%]" : "opacity-100"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center font-black text-[11px] self-end mb-1 border-2 border-white shadow-sm shrink-0",
                isMe ? "bg-primary text-on-primary" : "bg-white text-primary"
              )}>
                {isMe ? "YOU" : msg.sender?.fullName?.charAt(0) || "?"}
              </div>
              <div className={cn(
                "space-y-2 flex flex-col",
                isMe ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-5 rounded-[1.5rem] shadow-sm leading-relaxed text-sm font-medium transition-all",
                  isMe 
                    ? "bg-primary text-white rounded-br-none shadow-primary/10 border border-primary/20" 
                    : "bg-white text-on-surface rounded-bl-none border border-outline-variant/10"
                )}>
                  {msg.imageUrl && (
                    <div className="mb-3 relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden shadow-sm">
                       <img src={msg.imageUrl} alt="Attachment" className="w-full h-full object-cover" />
                       {msg.isOptimistic && msg.isUploading && (
                         <div className="absolute inset-0 bg-surface/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                            <MaterialIcon name="pending" className="text-white text-4xl animate-spin" />
                         </div>
                       )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <MaterialIcon 
                      name={msg.isOptimistic ? "done" : "done_all"} 
                      className={cn(
                        "text-[12px] transition-colors", 
                        msg.isOptimistic ? "text-slate-400 opacity-60" : "text-[#4dabf7] opacity-100"
                      )} 
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-4 max-w-2xl animate-in fade-in duration-500">
             <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center border-2 border-white shadow-sm shrink-0">
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                 <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse py-2">Moderator is typing...</p>
          </div>
        )}

        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-outline-variant/10 shadow-sm">
            <MaterialIcon name="lock" className="text-secondary text-sm" fill />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">End-to-End Encrypted Secure Channel</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/10 text-error px-6 py-2 text-xs font-bold flex items-center justify-center gap-2 border-t border-error/10">
          <MaterialIcon name="error" className="text-sm" /> {error}
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-surface-container relative">
        {/* Image Preview Container */}
        {previewUrl && (
          <div className="absolute bottom-full left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4 items-end shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border-2 border-primary/20 bg-slate-100">
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2 pb-1">
              <h4 className="text-xs font-bold text-slate-600">Attachment Preview</h4>
              <button 
                onClick={clearAttachment}
                disabled={isUploading}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors w-max"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative group flex items-center">
          <input 
            value={inputText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="w-full bg-surface-container-low/30 border-outline-variant/20 border-2 rounded-2xl py-3.5 pl-14 pr-16 focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-sm" 
            placeholder={isUploading ? "Sending secure message..." : "Type your secure message..."} 
            type="text"
            disabled={isUploading}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <MaterialIcon name="image" className="text-xl" />
            </button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={handleSendMessage}
              disabled={isUploading || (!inputText.trim() && !selectedFile)}
              className="bg-primary text-on-primary w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all group"
            >
              {isUploading ? (
                <MaterialIcon name="pending" className="text-lg animate-spin" />
              ) : (
                <MaterialIcon name="send" className="text-lg group-hover:rotate-12 transition-transform" fill />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
