import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebSocket(onMessage, onError, options = {}) {
  const {
    autoReconnect = true,
    maxRetries = 5,
    retryDelayMs = 300,
  } = options;

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const urlRef = useRef(null);
  const shouldReconnectRef = useRef(false);
  const retriesRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const cleanupSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    clearReconnectTimer();
  }, [clearReconnectTimer]);

  const attemptReconnect = useCallback(() => {
    if (!autoReconnect || !shouldReconnectRef.current || !urlRef.current) return;
    if (retriesRef.current >= maxRetries) return;
    const delay = retryDelayMs * (1 + retriesRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      retriesRef.current += 1;
      if (urlRef.current) {
        connect(urlRef.current, { skipRetryReset: true });
      }
    }, delay);
  }, [autoReconnect, maxRetries, retryDelayMs]);

  const connect = useCallback(
    (url, { skipRetryReset = false } = {}) => {
      urlRef.current = url;
      shouldReconnectRef.current = true;
      if (!skipRetryReset) {
        retriesRef.current = 0;
      }

      cleanupSocket();
      setConnectionError(null);

      try {
        wsRef.current = new WebSocket(url);
      } catch (err) {
        setConnectionError(err);
        if (onError) onError(err);
        return;
      }

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        retriesRef.current = 0;
        clearReconnectTimer();
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (shouldReconnectRef.current) {
          attemptReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        setConnectionError(error);
        if (onError) {
          onError(error);
        }
      };

      wsRef.current.onmessage = (event) => {
        if (typeof event.data === 'string') {
          setLastMessage(event.data);
          if (onMessage) {
            onMessage(event.data);
          }
        } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
          if (onMessage) {
            onMessage(event.data);
          }
        }
      };
    },
    [attemptReconnect, clearReconnectTimer, cleanupSocket, onError, onMessage]
  );

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.error('WebSocket is not connected. Message not sent.');
    }
  }, []);

  const close = useCallback(() => {
    shouldReconnectRef.current = false;
    cleanupSocket();
    setIsConnected(false);
  }, [cleanupSocket]);

  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      cleanupSocket();
    };
  }, [cleanupSocket]);

  return { connect, send, close, isConnected, lastMessage, connectionError };
}
