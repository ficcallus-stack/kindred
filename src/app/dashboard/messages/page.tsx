"use client";

import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white h-full">
      <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <MessageCircle size={32} className="text-slate-300" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Your Conversations</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-3 leading-relaxed">
        Select a conversation from the sidebar or start a new chat from a caregiver's profile to begin messaging securely.
      </p>
    </div>
  );
}
