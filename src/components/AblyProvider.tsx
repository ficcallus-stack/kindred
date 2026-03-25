"use client";

import { AblyProvider } from "@ably/react";
import * as Ably from "ably";
import { useMemo } from "react";

export default function AblyClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new Ably.Realtime({
      authUrl: "/api/ably/auth",
    });
  }, []);

  if (!client) return <>{children}</>;

  return <AblyProvider client={client as any}>{children}</AblyProvider>;
}
