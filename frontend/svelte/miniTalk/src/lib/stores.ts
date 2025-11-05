import { writable } from 'svelte/store';
import type { Message, User, TypingUser, ConnectionStatus, SystemMessage } from './types';

// Authentication stores
export const isAuthenticated = writable(false);
export const currentUser = writable('');

// Connection store
export const connectionStatus = writable<ConnectionStatus>({
  connected: false,
  attempting: false,
  error: undefined
});

// Chat stores
export const messages = writable<(Message | SystemMessage & { type: 'joined' | 'left' })[]>([]);
export const users = writable<User[]>([
  // Temporary test users - remove when real users connect
  { id: '1', pseudo: 'Alice', joinedAt: new Date() },
  { id: '2', pseudo: 'Bob', joinedAt: new Date() },
  { id: '3', pseudo: 'Charlie', joinedAt: new Date() }
]);
export const typingUsers = writable<TypingUser[]>([]);
export const deliveredMessages = writable<Set<string>>(new Set());
export const historyMessageCount = writable(0);
export const canLoadMoreHistory = writable(true);

// UI stores
export const showUserList = writable(true);
export const selectedMessageType = writable<'normal' | 'important' | 'urgent'>('normal');

// Toast notifications
export const toasts = writable<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

export function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Math.random().toString(36).substr(2, 9);
  toasts.update(list => [...list, { id, message, type }]);
  
  // Auto remove toast after 3 seconds
  setTimeout(() => {
    toasts.update(list => list.filter(toast => toast.id !== id));
  }, 3000);
}