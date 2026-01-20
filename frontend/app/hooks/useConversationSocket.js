import { useEffect, useRef, useState, useCallback } from 'react';

// Simple WebSocket hook for conversation streaming (placeholder).
export function useConversationSocket(userId) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      setConnected(false);
      return;
    }
    
    // Try port 8001 first (since backend is on 8001), fallback to 8000
    const tryConnect = (port = 8001) => {
      const url = `ws://localhost:${port}/ws/conversation/${userId}`;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
        };
        
        ws.onclose = () => {
          setConnected(false);
          // Try 8000 if 8001 closed unexpectedly
          if (port === 8001) {
            setTimeout(() => tryConnect(8000), 1000);
          }
        };
        
        ws.onerror = (error) => {
          setConnected(false);
          // Try alternate port on error
          if (port === 8001) {
            setTimeout(() => tryConnect(8000), 1000);
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data) {
              // Add ID if not present
              const messageWithId = { ...data, id: data.id || Date.now() + Math.random() };
              setMessages((prev) => [...prev, messageWithId]);
            }
          } catch (_) {
            // ignore parse errors
          }
        };
        
        return ws;
      } catch (err) {
        // If 8001 fails, try 8000
        if (port === 8001) {
          return tryConnect(8000);
        }
        return null;
      }
    };
    
    const ws = tryConnect();
    
    return () => {
      if (ws) ws.close();
      if (wsRef.current) wsRef.current.close();
    };
  }, [userId]);

  const sendUserMessage = useCallback((text, options = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    const payload = {
      role: 'user',
      text,
      level: options.level || 'A1',
      path: options.path || 'general',
      profession: options.profession,
      enable_progressive_disclosure: options.enable_progressive_disclosure !== false,
    };
    wsRef.current.send(JSON.stringify(payload));
  }, []);

  return { messages, sendUserMessage, connected };
}
