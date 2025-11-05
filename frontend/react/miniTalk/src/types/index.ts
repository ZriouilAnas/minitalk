export interface User {
  id: string;
  pseudo: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  pseudo: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  senderId: string;
}

export interface SystemMessage {
  pseudo: string;
  timestamp: Date;
  system: true;
}

export type MessageType = 'normal' | 'important' | 'urgent';

export interface TypingUser {
  pseudo: string;
  isTyping: boolean;
}

export interface MessageAcknowledgment {
  status: 'sent' | 'delivered' | 'error';
  messageId: string;
  timestamp: Date;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  attempting: boolean;
  error?: string;
}

export const MessageColors = {
  normal: '#10B981', // Green
  important: '#F59E0B', // Amber
  urgent: '#EF4444' // Red
} as const;

export const MessageTypeLabels = {
  normal: 'Normal',
  important: 'Important',
  urgent: 'Urgent'
} as const;