export type MessageType = 'normal' | 'important' | 'urgent';

export interface Message {
  id: string;
  pseudo: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  senderId: string;
}

export interface User {
  id: string;
  pseudo: string;
  joinedAt: Date;
}

export interface TypingUser {
  pseudo: string;
  isTyping: boolean;
}

export interface SystemMessage {
  pseudo: string;
  timestamp: Date;
  system: boolean;
}

export interface MessageAcknowledgment {
  status: 'sent' | 'error';
  messageId?: string;
  timestamp?: Date;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  attempting: boolean;
  error?: string;
}