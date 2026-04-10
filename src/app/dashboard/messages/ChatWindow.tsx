"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Send, MapPin, ExternalLink, X, Paperclip, Image as ImageIcon,
  FileText, Download, Play, Smile, Loader2, CheckCheck, Check,
  MoreVertical, ArrowDown, Mic, Camera, File, Video,
  Globe, WifiOff, Reply, Copy, Trash2, ChevronLeft, ShieldCheck, BadgeCheck
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { getConversationMessages, sendMessage, uploadMessageAttachment } from "./actions";
import { useMessages } from "./MessagesLayoutClient";
import { LinkPreview } from "@/components/dashboard/LinkPreview";
import Image from "next/image";

interface ChatWindowProps {
  convo: any;
  currentUser: any;
  onlineUserIds?: Set<string>;
}

type MessageStatus = "sending" | "sent" | "delivered" | "error";

interface AppMessage {
  id: string;
  senderId: string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  metadata?: any;
  createdAt: Date;
  status?: MessageStatus;
}

// ─── Emoji Picker (Inline lightweight) ─────────────────────
const QUICK_EMOJIS = ["😊", "❤️", "👍", "😂", "🙏", "🎉", "🔥", "✨", "💯", "😍", "🥰", "👋", "💪", "🤝", "👏", "😘"];

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 p-3 w-[280px]">
        <div className="grid grid-cols-8 gap-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg transition-all hover:scale-125 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Date Separator ────────────────────────────────────────
function DateSeparator({ date }: { date: Date }) {
  const d = new Date(date);
  let label = format(d, "MMMM d, yyyy");
  if (isToday(d)) label = "Today";
  else if (isYesterday(d)) label = "Yesterday";

  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-slate-200/60" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-[#f7f7f8] px-3 py-1 rounded-full">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200/60" />
    </div>
  );
}

// ─── File Preview Strip ────────────────────────────────────
function FilePreviewStrip({
  files,
  onRemove,
  onClear,
}: {
  files: File[];
  onRemove: (idx: number) => void;
  onClear: () => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {files.length} file{files.length > 1 ? "s" : ""} selected
        </span>
        <button onClick={onClear} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
          Clear All
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {files.map((file, idx) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          return (
            <div key={idx} className="relative shrink-0 group">
              {isImage ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                </div>
              ) : isVideo ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-900 flex items-center justify-center">
                  <Play size={20} className="text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-white shadow-md bg-white flex flex-col items-center justify-center gap-1 px-1">
                  <FileText size={16} className="text-slate-500" />
                  <span className="text-[7px] font-bold text-slate-400 truncate w-full text-center">{file.name.split(".").pop()?.toUpperCase()}</span>
                </div>
              )}
              <button
                onClick={() => onRemove(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────
function MessageBubble({
  message,
  isMe,
  showAvatar,
  otherMember,
}: {
  message: AppMessage;
  isMe: boolean;
  showAvatar: boolean;
  otherMember: any;
}) {
  const hasFile = !!message.fileUrl;
  const isImage = message.fileType?.startsWith("image");
  const isVideo = message.fileType?.startsWith("video");
  const isDoc = hasFile && !isImage && !isVideo;
  const hasLinks = message.content?.match(/https?:\/\/[^\s]+/g);
  const hasMapLink = message.content?.match(/https?:\/\/(www\.)?google\.com\/maps\/[^\s]+/) ||
                     message.content?.match(/https?:\/\/maps\.apple\.com\/[^\s]+/);

  const statusIcon = () => {
    if (!isMe) return null;
    switch (message.status) {
      case "sending":
        return <Loader2 size={12} className="animate-spin text-white/40" />;
      case "sent":
        return <Check size={12} className="text-white/50" />;
      case "delivered":
        return <CheckCheck size={12} className="text-emerald-300" />;
      case "error":
        return <span className="text-[8px] font-bold text-red-300 uppercase">Failed</span>;
      default:
        return <CheckCheck size={12} className="text-white/40" />;
    }
  };

  return (
    <div className={cn(
      "flex gap-2.5 mb-1 group animate-in fade-in slide-in-from-bottom-1 duration-300",
      isMe ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className="w-8 shrink-0 flex flex-col justify-end">
        {showAvatar && !isMe && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[11px] font-bold text-slate-600 shadow-sm overflow-hidden">
            {otherMember?.profileImageUrl ? (
              <Image src={otherMember.profileImageUrl} alt="" width={32} height={32} className="object-cover" />
            ) : (
              otherMember?.fullName?.charAt(0) || "?"
            )}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[70%] min-w-[120px]")}>
        <div className={cn(
          "relative overflow-hidden transition-all duration-200",
          isMe
            ? "bg-gradient-to-br from-[#0a2540] to-[#1a3a5c] text-white rounded-[18px_18px_4px_18px] shadow-lg shadow-blue-950/8"
            : "bg-white text-slate-800 rounded-[18px_18px_18px_4px] shadow-sm shadow-black/[0.04] border border-slate-100/80",
        )}>
          {/* Image attachment */}
          {isImage && message.fileUrl && (
            <div className="cursor-pointer overflow-hidden" onClick={() => window.open(message.fileUrl!, "_blank")}>
              <img
                src={message.fileUrl}
                alt={message.fileName || "Image"}
                className="w-full max-w-[360px] h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </div>
          )}

          {/* Video attachment */}
          {isVideo && message.fileUrl && (
            <div className="max-w-[360px] overflow-hidden">
              <video
                src={message.fileUrl}
                controls
                className="w-full h-auto rounded-t-none"
                poster={message.metadata?.thumbnail}
              />
            </div>
          )}

          {/* Document attachment */}
          {isDoc && message.fileUrl && (
            <div
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                isMe ? "hover:bg-white/5" : "hover:bg-slate-50 border-b border-slate-50"
              )}
              onClick={() => window.open(message.fileUrl!, "_blank")}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                isMe ? "bg-white/10" : "bg-slate-100"
              )}>
                <FileText className={isMe ? "text-white/80" : "text-slate-500"} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-semibold truncate", isMe ? "text-white" : "text-slate-700")}>
                  {message.fileName || "Document"}
                </p>
                <p className={cn("text-[10px] mt-0.5", isMe ? "text-white/50" : "text-slate-400")}>
                  {message.metadata?.size
                    ? `${(message.metadata.size / 1024 / 1024).toFixed(1)} MB`
                    : "Tap to download"}
                </p>
              </div>
              <Download size={16} className={isMe ? "text-white/30" : "text-slate-300"} />
            </div>
          )}

          {/* Map Link (Special Rendering) */}
          {hasMapLink && (
            <div
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer transition-colors rounded-xl mx-3 mt-3 mb-1",
                isMe ? "bg-white/10 hover:bg-white/15" : "bg-blue-50 hover:bg-blue-100/70"
              )}
              onClick={() => window.open(hasMapLink[0], "_blank")}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                isMe ? "bg-blue-400/20" : "bg-blue-500/10"
              )}>
                <MapPin className={isMe ? "text-blue-300" : "text-blue-500"} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-semibold", isMe ? "text-white" : "text-slate-700")}>Shared Location</p>
                <p className={cn("text-[10px] mt-0.5", isMe ? "text-white/50" : "text-slate-400")}>Tap to view on Maps</p>
              </div>
              <ExternalLink size={14} className={isMe ? "text-white/30" : "text-slate-300"} />
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div className="px-4 py-2.5">
              <p className={cn(
                "text-[14.5px] leading-relaxed whitespace-pre-wrap break-words",
                isMe ? "text-white/95" : "text-slate-700"
              )}>
                {message.content}
              </p>
            </div>
          )}

          {/* Link Previews */}
          {hasLinks && !hasMapLink && (
            <div className="px-3 pb-2">
              {hasLinks.slice(0, 2).map((url, i) => (
                <LinkPreview key={i} url={url} />
              ))}
            </div>
          )}

          {/* Timestamp + Status bar */}
          <div className={cn(
            "px-4 pb-2 pt-0.5 flex items-center gap-1.5",
            isMe ? "justify-end" : "justify-start"
          )}>
            <span className={cn(
              "text-[10px] font-medium tabular-nums",
              isMe ? "text-white/40" : "text-slate-400"
            )}>
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
            {statusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ─── MAIN CHAT WINDOW ──────────────────────────────────────
// ═════════════════════════════════════════════════════════════
export default function ChatWindow({ convo, currentUser }: ChatWindowProps) {
  const router = useRouter();
  const { ably, onlineUserIds } = useMessages();

  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // File Upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOtherOnline = onlineUserIds.has(convo.otherMember?.id);

  // ─── Ably Channel Setup ──────────────────────────────────
  useEffect(() => {
    if (!ably || !convo.id) return;

    const channelName = `conversation:${convo.id}`;
    const chatChannel = ably.channels.get(channelName);
    setChannel(chatChannel);

    chatChannel.subscribe("message", (msg: any) => {
      // Prevent duplication: ignore messages originating from our own user ID
      // since they are already appended optimistically to the UI.
      if (msg.clientId === currentUser.id || msg.data.senderId === currentUser.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.data.id)) return prev;
        return [...prev, { ...msg.data, createdAt: new Date(msg.data.createdAt) }];
      });
    });

    chatChannel.subscribe("typing", (msg: any) => {
      if (msg.clientId !== currentUser.id) {
        setIsTyping(msg.data.isTyping);
      }
    });

    return () => {
      chatChannel.unsubscribe();
    };
  }, [ably, convo.id, currentUser.id]);

  // ─── Load Message History ────────────────────────────────
  useEffect(() => {
    if (!convo.id) return;
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const history = await getConversationMessages(convo.id);
        const mappedHistory: AppMessage[] = history.reverse().map(m => ({
          ...m,
          content: m.content ?? undefined,
          fileUrl: m.fileUrl ?? undefined,
          fileType: m.fileType ?? undefined,
          fileName: m.fileName ?? undefined,
        }));
        setMessages(mappedHistory);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [convo.id]);

  // ─── Auto-scroll to bottom ──────────────────────────────
  // Only scroll down when the conversation initially finishes loading.
  useEffect(() => {
    if (!isLoading) {
      // Small timeout to ensure DOM painted
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [convo.id, isLoading]);

  // Handle new messages: Only scroll if already at bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && messages.length > 0) {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom < 150) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length]);

  // ─── Scroll Position Tracking ────────────────────────────
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distanceFromBottom > 200);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Typing Indicator ───────────────────────────────────
  const publishTyping = (typing: boolean) => {
    if (channel) channel.publish("typing", { isTyping: typing });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    publishTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => publishTyping(false), 2500);
  };

  // ─── Send Text Message ──────────────────────────────────
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if ((!text && selectedFiles.length === 0) || !convo.id) return;

    setIsSending(true);
    setShowEmojis(false);

    // If files are selected, upload them
    if (selectedFiles.length > 0) {
      await handleSendFiles(text);
      setIsSending(false);
      return;
    }

    const tempMsg: AppMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      content: text,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputValue("");
    publishTyping(false);

    try {
      await sendMessage({ conversationId: convo.id, content: text });
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...m, status: "sent" } : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...m, status: "error" } : m)));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // ─── Send Files ──────────────────────────────────────────
  const handleSendFiles = async (caption?: string) => {
    for (const file of selectedFiles) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      const tempMsg: AppMessage = {
        id: tempId,
        senderId: currentUser.id,
        content: caption || undefined,
        fileUrl: previewUrl,
        fileType: file.type,
        fileName: file.name,
        metadata: { size: file.size },
        createdAt: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMsg]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadedUrl = await uploadMessageAttachment(formData);

        await sendMessage({
          conversationId: convo.id,
          content: caption || undefined,
          fileUrl: uploadedUrl,
          fileType: file.type,
          fileName: file.name,
          metadata: { size: file.size },
        });

        setMessages((prev) => prev.map((m) =>
          m.id === tempId
            ? { ...m, fileUrl: uploadedUrl, status: "sent" }
            : m
        ));
      } catch {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "error" } : m)));
      }

      // Only include caption on the first file
      caption = undefined;
    }

    setSelectedFiles([]);
    setInputValue("");
    publishTyping(false);
  };

  // ─── File Selection ──────────────────────────────────────
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 25 * 1024 * 1024); // 25MB max
    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid].slice(0, 10));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Drag & Drop ────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.size <= 25 * 1024 * 1024);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    }
  };

  // ─── Emoji Insert ───────────────────────────────────────
  const insertEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // ─── Group Messages by Date ──────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: AppMessage[] }[]>((acc, msg) => {
    const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.msgs.push(msg);
    } else {
      acc.push({ date: dateKey, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <div
      className="flex-1 flex flex-col bg-[#f7f7f8] relative h-full overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ─── Drag Overlay ─────────────────────────────────── */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center animate-in fade-in duration-150">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Paperclip size={28} className="text-blue-500" />
            </div>
            <p className="text-blue-600 font-semibold text-sm">Drop files here</p>
            <p className="text-blue-400 text-xs mt-1">Images, videos, documents up to 25MB</p>
          </div>
        </div>
      )}

      {/* ─── Chat Header ──────────────────────────────────── */}
      <header className="px-6 py-4 md:py-5 flex items-center justify-between bg-white/80 backdrop-blur-2xl border-b border-slate-100 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => router.push("/dashboard/messages")}
            className="md:hidden p-1.5 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
             <ChevronLeft size={24} />
          </button>
          
          {convo.isSupport ? (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-slate-100 p-1">
                  <Image src="/images/kindredLogo/logomark.png" alt="KindredCare US" width={32} height={32} className="object-contain" />
                </div>
                {/* Always online for Support */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-[16px] text-[#0a2540] tracking-tight leading-tight">
                    KindredCare US Support
                  </h2>
                  <BadgeCheck size={18} className="text-blue-600 fill-blue-50" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full transition-colors bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                    {isTyping ? "Support is typing..." : "Online • Assistance"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 overflow-hidden shadow-sm">
                  {convo.otherMember?.profileImageUrl ? (
                    <Image src={convo.otherMember.profileImageUrl} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    convo.otherMember?.fullName?.charAt(0) || "?"
                  )}
                </div>
                {isOtherOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-[15px] text-slate-800 leading-tight">
                  {convo.otherMember?.fullName || "Conversation"}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isTyping ? (
                    <span className="text-[11px] text-blue-500 font-medium animate-pulse">typing...</span>
                  ) : (
                    <>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        isOtherOnline ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isOtherOnline ? "Online" : "Offline"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            onClick={() => router.push("/dashboard/messages")}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ─── Message Feed ─────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d4d4d8 transparent" }}
      >
        {isLoading ? (
          <div className="h-full flex flex-col p-6 space-y-8 animate-in fade-in duration-500">
            {/* Top Skeleton Badge */}
            <div className="flex justify-center">
               <div className="w-48 h-6 bg-slate-200/60 rounded-full animate-pulse" />
            </div>
            
            {/* Skeleton Bubbles */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "flex-row")}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="space-y-2">
                    <div className={cn("h-10 rounded-2xl bg-slate-200 animate-pulse", i === 1 ? "w-64" : i === 2 ? "w-48" : "w-72")} />
                    <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 flex items-end justify-center pb-12">
               <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Synchronizing Local Node</p>
               </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Send size={24} className="text-slate-400" />
              </div>
              <div>
                <p className="text-slate-600 font-semibold text-sm">Start the conversation</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Send a message or share a file to begin chatting with {convo.otherMember?.fullName?.split(" ")[0] || "them"}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Encryption Notice */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <ShieldCheck size={12} className="text-blue-500" />
                <span>End-to-End Secure Priority Support</span>
              </div>

              {convo.isSupport && convo.moderatorName && (
                <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {convo.moderatorImage ? (
                        <Image src={convo.moderatorImage} alt={convo.moderatorName} width={48} height={48} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {convo.moderatorName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">Response Handler</p>
                      <h3 className="text-sm font-bold text-[#0a2540]">{convo.moderatorName}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Assigned to your request • Priority Assistance</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateSeparator date={new Date(group.date)} />
                {group.msgs.map((msg, idx) => {
                  const prevMsg = idx > 0 ? group.msgs[idx - 1] : null;
                  const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={msg.senderId === currentUser.id}
                      showAvatar={showAvatar}
                      otherMember={convo.otherMember}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2.5 ml-10 my-3 animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* ─── Scroll-to-Bottom Button ──────────────────────── */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-6 w-10 h-10 bg-white shadow-lg shadow-black/10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all z-20 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-100"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* ─── File Preview Strip ───────────────────────────── */}
      <FilePreviewStrip
        files={selectedFiles}
        onRemove={removeFile}
        onClear={() => setSelectedFiles([])}
      />

      {/* ─── Input Footer ─────────────────────────────────── */}
      <footer className="p-3 bg-white border-t border-slate-100 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0"
            >
              <Paperclip size={20} />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              {showEmojis && (
                <EmojiPicker
                  onSelect={insertEmoji}
                  onClose={() => setShowEmojis(false)}
                />
              )}
              <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="pl-3 pr-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <Smile size={20} />
                </button>
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] py-3 px-2 text-slate-700 placeholder:text-slate-400"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onFocus={() => setShowEmojis(false)}
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                (inputValue.trim() || selectedFiles.length > 0)
                  ? "bg-[#0a2540] text-white shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-105 active:scale-95"
                  : "bg-slate-100 text-slate-400"
              )}
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && selectedFiles.length === 0) || isSending}
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
