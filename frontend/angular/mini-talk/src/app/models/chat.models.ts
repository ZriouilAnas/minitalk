export interface User {
  id: string;
  pseudo: string;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  pseudo: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  senderId: string;
}

export enum MessageType {
  NORMAL = 'normal',
  IMPORTANT = 'important',
  URGENT = 'urgent',
}

export interface TypingUser {
  pseudo: string;
  isTyping: boolean;
}

export interface AuthData {
  pseudo: string;
}

export interface ServerHealth {
  status: string;
  connectedUsers: number;
  timestamp: Date;
}
