"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";

interface MessagesClientProps {
  initialConversations: any[];
  supportConversations: any[];
  currentUser: any;
}

export default function MessagesClient({ initialConversations, supportConversations, currentUser }: MessagesClientProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "chats";
  const [activeTab, setActiveTab] = useState<"chats" | "archived" | "support">(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "support" || tab === "archived" || tab === "chats") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const conversationsToShow = activeTab === "support" 
    ? supportConversations 
    : initialConversations.filter(c => !c.isArchived); // Placeholder for archive logic

  return (
    <div className="bg-surface min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 pt-20 h-screen overflow-hidden">
        <ChatSidebar 
          conversations={conversationsToShow} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <main className="flex-1 flex flex-col items-center justify-center p-12 bg-surface-container-low/30 relative overflow-hidden">
          {/* Bento Background Decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32" />

          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-outline-variant/10 relative group">
              <MaterialIcon name="chat_bubble" className="text-4xl text-primary animate-pulse" fill />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">
                !
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic">Select a Conversation</h2>
              <p className="text-on-surface-variant font-medium opacity-60 leading-relaxed italic">
                {activeTab === "support" 
                  ? "Our dedicated moderators are standing by to ensure your experience remains safe and seamless."
                  : "Pick a chat from the sidebar to continue your journey. Your messages are encrypted and secure."}
              </p>
            </div>

            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-outline-variant/10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <MaterialIcon name="verified_user" className="text-primary text-sm" fill />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Identity</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-outline-variant/10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <MaterialIcon name="lock" className="text-secondary text-sm" fill />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">E2E Encrypted</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
