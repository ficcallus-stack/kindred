"use client";

import { AblyProvider as ReactAblyProvider } from "ably/react";
import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createAblyClient } from "@/lib/ably";

export default function AblyClientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const client = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!user?.uid) return null;
    return createAblyClient(user.uid);
  }, [user?.uid]);

  if (!client) return <>{children}</>;

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}
