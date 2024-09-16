import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface WebSocketContextProps {
    socket: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const useWebSocket = (): WebSocket | null => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context.socket;
};

export function WebSocketProvider({ children }: {
    children: ReactNode
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        try {
            const ws = new WebSocket("ws://localhost:8080");

        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        return () => {
            ws.close();
        }

        } catch (error) {
            throw new Error("error connection to websocket server")
        }
    }, [])

    return (
        <WebSocketContext.Provider value={{socket}} >
            {children}
        </WebSocketContext.Provider>
    )
}