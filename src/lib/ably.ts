import Ably from 'ably';

/**
 * Returns a new Ably Realtime instance. 
 * We use a function to ensure it's only called on the client.
 * Note: ABLY_API_KEY is retrieved from environment variables.
 */
export function createAblyClient(clientId?: string) {
  if (typeof window === 'undefined') return null;
  
  return new Ably.Realtime({
    authCallback: async (tokenParams, callback) => {
      try {
        const response = await fetch('/api/ably/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Ably Auth failed with status: ${response.status}`);
        }

        const tokenRequest = await response.json();
        callback(null as any, tokenRequest);
      } catch (error: any) {
        console.error("[ABLY AUTH CALLBACK ERROR]", error.message);
        callback(error, null as any);
      }
    },
    clientId: clientId, 
    autoConnect: true,
    echoMessages: false,
    httpRequestTimeout: 30000, // Be more patient with serverless cold starts
  });
}
