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

/**
 * Hook for Ably Presence tracking (Stage 4)
 */
export function useAblyPresence(channelName: string, onUpdate?: (members: Ably.PresenceMessage[]) => void) {
  const [presentMembers, setPresentMembers] = useState<Ably.PresenceMessage[]>([]);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!ablyClient) {
      ablyClient = new Ably.Realtime({ authUrl: '/api/ably/auth' });
    }

    const _channel = ablyClient.channels.get(channelName);

    const updatePresence = async () => {
      const members = await _channel.presence.get();
      setPresentMembers(members);
      if (onUpdateRef.current) onUpdateRef.current(members);
    };

    _channel.presence.subscribe(["enter", "leave", "update"], updatePresence);
    updatePresence(); // Initial fetch

    return () => {
      _channel.presence.unsubscribe();
    };
  }, [channelName]);

  return { presentMembers, channel: ablyClient?.channels.get(channelName) };
}
