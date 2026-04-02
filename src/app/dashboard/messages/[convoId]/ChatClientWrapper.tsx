"use client";

import { useMessages } from "../MessagesLayoutClient";
import ChatWindow from "../ChatWindow";

export default function ChatClientWrapper({ convo }: { convo: any }) {
  const { onlineUserIds, currentUser } = useMessages();

  return (
    <ChatWindow 
      convo={convo}
      currentUser={currentUser}
      onlineUserIds={onlineUserIds}
    />
  );
}
