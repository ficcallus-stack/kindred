"use client";

import { useEffect, useState, useRef } from "react";
import * as Ably from "ably";

// Placeholder for now, proper instantiation should be in a context or global scope
// This avoids reconnecting on every render
let ablyClient: Ably.Realtime | null = null;

export function useAbly(channelName: string, callback?: (message: Ably.InboundMessage) => void) {
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!ablyClient) {
      ablyClient = new Ably.Realtime({ authUrl: '/api/ably/auth' });
    }

    const _channel = ablyClient.channels.get(channelName);
    setChannel(_channel);

    const subscription = (message: Ably.InboundMessage) => {
      console.log("ABLY RECEIVE EVENT:", message.name, message.data);
      if (callbackRef.current) {
        callbackRef.current(message);
      }
    };

    _channel.subscribe(subscription);

    return () => {
      _channel.unsubscribe(subscription);
      // Remove detatch() because React 18 StrictMode causes race conditions here!
    };
  }, [channelName]);

  return { channel };
}
