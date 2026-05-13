import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("Idle");
    const [isConnected, setIsConnected] = useState(false);
    
    // Dynamic Evaluation Metrics (Start at poor baselines before FL)
    const [mape, setMape] = useState(88.0);
    const [accuracy, setAccuracy] = useState(12.0);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
            setIsConnected(true);
            console.log("WebSocket connected!");
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === "status") {
                    setStatus(data.message);
                    if (data.mape !== undefined) setMape(data.mape);
                    if (data.accuracy !== undefined) setAccuracy(data.accuracy);
                } else if (data.type === "event") {
                    setMessages(prev => [...prev, { time: new Date().toLocaleTimeString(), text: data.message }]);
                }
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        };

        wsRef.current.onclose = () => {
            setIsConnected(false);
            console.log("WebSocket disconnected. Attempting reconnect...");
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            wsRef.current.close();
        };
    }, [url]);

    const sendMessage = (msg) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify(msg));
        }
    };

    useEffect(() => {
        connect();
        
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    return { messages, status, isConnected, sendMessage, mape, accuracy };
};
