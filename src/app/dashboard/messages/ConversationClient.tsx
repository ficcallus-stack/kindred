"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { JobQuickView } from "@/components/dashboard/JobQuickView";

interface ConversationClientProps {
  conversation: any;
  messages: any[];
  conversations: any[];
  supportConversations: any[];
  currentUser: any;
  otherMember?: any;
}

export default function ConversationClient({ 
  conversation, 
  messages: initialMessages, 
  conversations, 
  supportConversations,
  currentUser,
  otherMember 
}: ConversationClientProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "archived" | "support">(
    conversation.isSupport ? "support" : "chats"
  );

  const conversationsToShow = activeTab === "support" 
    ? supportConversations 
    : conversations.filter(c => !c.isArchived);

  return (
    <div className="bg-surface min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 pt-20 h-screen overflow-hidden">
        <ChatSidebar 
          conversations={conversationsToShow} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <ChatWindow 
          conversationId={conversation.id}
          initialMessages={initialMessages}
          currentUser={currentUser}
          otherMember={otherMember}
          isSupport={conversation.isSupport}
        />

        {!conversation.isSupport && (
          <JobQuickView 
            nannyId={otherMember?.role === "caregiver" ? otherMember?.id : undefined}
            isNannyView={currentUser.role === "caregiver"}
          />
        )}
      </div>
    </div>
  );
}
