import * as Ably from "ably";
import { auth } from "@/lib/firebase-client";

let ablyClient: Ably.Realtime | null = null;
let lastClientId: string | null = null;

/**
 * Returns a cached Ably Realtime instance (Singleton).
 * In Next.js, we reuse the connection to prevent "detached" errors
 * caused by multiple simultaneous connection attempts for the same ID.
 */
export function createAblyClient(clientId?: string): Ably.Realtime | null {
  if (typeof window === 'undefined') return null;

  // If we already have a client for this exact ID, reuse it
  if (ablyClient && lastClientId === clientId) {
    if (ablyClient.connection.state === 'failed' || ablyClient.connection.state === 'closed') {
      ablyClient.connect();
    }
    return ablyClient;
  }

  // If ID changed, close the old one
  if (ablyClient && lastClientId !== clientId) {
    try {
      ablyClient.close();
    } catch {}
    ablyClient = null;
  }
  
  const client = new Ably.Realtime({
    authCallback: (tokenParams, callback) => {
      (async () => {
        try {
          if (!auth.currentUser) return callback("No user logged in", null);
          
          // CRITICAL: Fetch a *fresh* token each time Ably needs a handshake
          const freshToken = await auth.currentUser.getIdToken(true);

          const res = await fetch('/api/ably/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${freshToken}`
            }
          });

          if (!res.ok) return callback(`Server returned ${res.status}`, null);
          const tokenResponse = await res.json();
          callback(null, tokenResponse);
        } catch (err: any) {
          console.error("[ABLY HANDSHAKE] Failed:", err.message);
          callback(err, null);
        }
      })();
    },
    clientId: clientId, 
    autoConnect: true,
    echoMessages: false,
    queryTime: true, 
    transports: ['web_socket', 'xhr_polling'],
    httpRequestTimeout: 30000,
  });

  ablyClient = client;
  lastClientId = clientId || null;
  return client;
}
