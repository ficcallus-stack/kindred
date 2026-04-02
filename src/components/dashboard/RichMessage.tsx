"use client";

import Image from "next/image";
import { FileText, Play, Download, ExternalLink, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LinkPreview } from "./LinkPreview";

interface RichMessageProps {
  message: {
    id: string;
    content?: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    createdAt: Date;
    senderId: string;
    metadata?: any;
  };
  isMe: boolean;
}

export function RichMessage({ message, isMe }: RichMessageProps) {
  const { content, fileUrl, fileType, fileName } = message;

  return (
    <div className={cn(
      "flex flex-col gap-1 max-w-[85%]",
      isMe ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "relative group transition-all duration-300 ease-out",
        isMe 
          ? "bg-gradient-to-br from-[#031f41] to-[#1d3557] text-white rounded-[20px_20px_4px_20px] shadow-lg shadow-blue-900/10" 
          : "bg-white text-[#1a1c1c] rounded-[20px_20px_20px_4px] border border-slate-100 shadow-sm"
      )}>
        {/* Rich Media Content */}
        {fileUrl && (
          <div className="mb-2 overflow-hidden rounded-xl">
            {fileType?.startsWith('image') && (
              <div className="relative aspect-auto min-w-[200px] max-w-[400px] cursor-zoom-in" onClick={() => window.open(fileUrl, '_blank')}>
                <img 
                  src={fileUrl} 
                  alt={fileName || "Image"} 
                  className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            )}

            {fileType?.startsWith('video') && (
              <div className="relative aspect-video min-w-[280px] max-w-[400px]">
                <video 
                  src={fileUrl} 
                  controls 
                  className="w-full h-full rounded-lg"
                  poster={message.metadata?.thumbnail}
                />
              </div>
            )}

            {fileType === 'document' && (
              <div 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors",
                  isMe ? "bg-white/10 hover:bg-white/20" : "bg-slate-50 hover:bg-slate-100"
                )}
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                  isMe ? "bg-white/20" : "bg-white border border-slate-200"
                )}>
                  <FileText className={isMe ? "text-white" : "text-slate-600"} size={24} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-sm truncate uppercase tracking-tighter">{fileName || "Document"}</p>
                  <p className="text-[10px] opacity-60 font-black tracking-widest uppercase mt-0.5">
                    {message.metadata?.size ? `${(message.metadata.size / 1024 / 1024).toFixed(1)} MB` : "Download File"}
                  </p>
                </div>
                <Download size={18} className="opacity-40" />
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        {content && (
          <div className="px-5 py-3.5 space-y-2">
            <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap selection:bg-blue-500/30">
              {content}
            </p>
            
            {/* Link Preview Migration */}
            {content.match(/https?:\/\/[^\s]+/g)?.map((url, i) => (
              <LinkPreview key={i} url={url} />
            ))}
          </div>
        )}

        {/* Status & Timestamp */}
        <div className={cn(
          "px-5 pb-2 flex items-center gap-2",
          isMe ? "justify-end text-white/50" : "justify-start text-slate-400"
        )}>
          <span className="text-[10px] font-black uppercase tracking-widest italic font-headline">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
}
