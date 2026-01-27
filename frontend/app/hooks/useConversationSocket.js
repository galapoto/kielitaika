import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_API_BASE } from '../config/backend';

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
    
    const url = `${WS_API_BASE}/ws/conversation/${userId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };
    
    ws.onclose = () => {
      setConnected(false);
    };
    
    ws.onerror = (error) => {
      setConnected(false);
      console.error('Conversation WebSocket error:', error);
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
        console.error('Conversation WebSocket message parse error');
      }
    };
    
    return () => {
      if (ws) ws.close();
      if (wsRef.current) wsRef.current.close();
    };
  }, [userId]);

  const sendUserMessage = useCallback((text, options = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      console.error('Conversation WebSocket is not connected. Message not sent.');
      return;
    }
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
