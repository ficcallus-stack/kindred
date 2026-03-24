"use client";

import { useState, useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { getConversationMessages, sendMessage } from "../actions";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    params.then((p) => {
      setConversationId(p.id);
      loadMessages(p.id);
    });
  }, [params]);

  async function loadMessages(id: string) {
    try {
      const msgs = await getConversationMessages(id);
      setMessages(msgs);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => loadMessages(conversationId), 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSend() {
    if (!newMessage.trim() || sending || !conversationId) return;

    setSending(true);
    try {
      await sendMessage({ conversationId, content: newMessage.trim() });
      setNewMessage("");
      await loadMessages(conversationId);
    } catch (e: any) {
      alert(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link
            href="/dashboard/messages"
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all"
          >
            <MaterialIcon name="arrow_back" className="text-xl text-primary" />
          </Link>
          <div>
            <h1 className="font-headline font-black text-primary text-lg tracking-tighter">Conversation</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{messages.length} messages</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 pt-28 pb-32 px-6 max-w-4xl mx-auto w-full overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg: any) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-6 py-4 rounded-3xl ${
                  isOwn
                    ? "bg-primary text-white rounded-br-lg"
                    : "bg-surface-container-lowest text-on-surface rounded-bl-lg shadow-sm border border-outline-variant/10"
                }`}>
                  {!isOwn && (
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">
                      {msg.sender?.fullName || "Unknown"}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[9px] mt-2 ${isOwn ? "text-white/50" : "text-slate-400"} font-black tracking-widest`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-surface-container-low rounded-2xl px-6 py-4 text-sm font-medium border-none focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-40 active:scale-95"
          >
            <MaterialIcon name="send" className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
