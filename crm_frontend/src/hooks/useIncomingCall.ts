import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { getAuthToken, API_BASE_URL } from "@/services/api";

export interface IncomingCallPayload {
  phone: string;
  callSid?: string | null;
  to?: string | null;
  event?: string;
  timestamp?: string;
}

interface UseIncomingCallOptions {
  onIncomingCall?: (payload: IncomingCallPayload) => void;
}

interface UseIncomingCallResult {
  incomingCall: IncomingCallPayload | null;
  clearIncomingCall: () => void;
}

export function useIncomingCall(options: UseIncomingCallOptions = {}): UseIncomingCallResult {
  const { onIncomingCall } = options;
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const onIncomingRef = useRef(onIncomingCall);

  useEffect(() => {
    onIncomingRef.current = onIncomingCall;
  }, [onIncomingCall]);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const wsUrl = API_BASE_URL.replace(/^http/, "ws").replace(/\/api$/, "");

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("call:incoming", (payload: IncomingCallPayload) => {
      if (!payload?.phone) return;
      setIncomingCall(payload);
      onIncomingRef.current?.(payload);
    });

    return () => {
      socket.off("call:incoming");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { incomingCall, clearIncomingCall };
}
