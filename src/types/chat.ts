export interface ChatMessage {
  msg: string;
  user?: string;
  timestamp?: string;
}


export interface User {
  id: string;
  username: string;
}


export interface ServerToClientEvents {
  "new message": (data: ChatMessage) => void;
  "get users": (data: string[]) => void;
}


export interface ClientToServerEvents {
  "send message": (data: string) => void;
  "new user": (data: string, callback?: (success: boolean) => void) => void;
}


export interface InterServerEvents {
  ping: () => void;
}


export interface SocketData {
  username?: string;
}


export interface ServerStatusResponse {
  status: string;
  uptime: number;
  activeConnections: number;
  totalMessages: number;
  timestamp: string;
}