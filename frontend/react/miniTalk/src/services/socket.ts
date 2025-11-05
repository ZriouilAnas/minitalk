import { io, Socket } from 'socket.io-client';
import type { Message, User, TypingUser, MessageAcknowledgment, SystemMessage, MessageType } from '../types';

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManualDisconnect = false;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3000') {
    this.serverUrl = serverUrl;
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('✅ Already connected to server');
        resolve(this.socket);
        return;
      }

      // Clean up existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      console.log('🔌 Connecting to server:', this.serverUrl);
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
        if (!this.isManualDisconnect && reason === 'io server disconnect') {
          // Server disconnected the client, attempt to reconnect
          this.attemptReconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('🔄 Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('🔄 Reconnection failed after maximum attempts');
      });
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔄 Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (!this.socket?.connected && !this.isManualDisconnect) {
        this.connect().catch(console.error);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    console.log('🔌 Manually disconnecting socket');
    this.isManualDisconnect = true;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Authentication
  setPseudo(pseudo: string): Promise<{ pseudo: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      // Clear any existing listeners to avoid duplicates
      this.socket.off('auth:success');
      this.socket.off('auth:error');

      const onSuccess = (data: { pseudo: string }) => {
        this.socket?.off('auth:error', onError);
        console.log('✅ Authentication successful:', data);
        resolve(data);
      };

      const onError = (error: string) => {
        this.socket?.off('auth:success', onSuccess);
        console.error('❌ Authentication failed:', error);
        reject(new Error(error));
      };

      this.socket.once('auth:success', onSuccess);
      this.socket.once('auth:error', onError);
      
      console.log('🔐 Attempting to set pseudo:', pseudo);
      this.socket.emit('auth:set-pseudo', { pseudo });
    });
  }

  // Message handling
  sendMessage(content: string, type: MessageType = 'normal'): Promise<MessageAcknowledgment> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      if (!this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('📤 Sending message:', { content: content.substring(0, 50) + '...', type });
      
      this.socket.emit('message:send', { content, type }, (response: MessageAcknowledgment) => {
        if (response && response.status === 'error') {
          console.error('❌ Message send error:', response.error);
          reject(new Error(response.error));
        } else if (response) {
          console.log('✅ Message sent successfully:', response);
          resolve(response);
        } else {
          console.error('❌ No response from server');
          reject(new Error('No response from server'));
        }
      });
    });
  }

  // History management
  requestMoreHistory(limit: number = 20): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      this.socket.once('message:more-history', (messages: Message[]) => {
        clearTimeout(timeout);
        resolve(messages);
      });

      this.socket.emit('message:request-history', { limit });
    });
  }

  // Typing indicators
  startTyping() {
    this.socket?.emit('user:typing');
  }

  stopTyping() {
    this.socket?.emit('user:stop-typing');
  }

  // Event listeners
  onRequirePseudo(callback: () => void) {
    this.socket?.on('auth:require-pseudo', callback);
  }

  onMessage(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  onMessageHistory(callback: (messages: Message[]) => void) {
    this.socket?.on('message:history', callback);
  }

  onUserJoined(callback: (data: SystemMessage) => void) {
    this.socket?.on('user:joined', callback);
  }

  onUserLeft(callback: (data: SystemMessage) => void) {
    this.socket?.on('user:left', callback);
  }

  onUsersUpdate(callback: (users: User[]) => void) {
    this.socket?.on('users:update', callback);
  }

  onUserTyping(callback: (data: TypingUser) => void) {
    this.socket?.on('user:typing', callback);
  }

  onError(callback: (error: string) => void) {
    this.socket?.on('error', callback);
  }

  onConnect(callback: () => void) {
    this.socket?.on('connect', callback);
  }

  onDisconnect(callback: (reason: string) => void) {
    this.socket?.on('disconnect', callback);
  }

  onReconnecting(callback: (attemptNumber: number) => void) {
    this.socket?.on('reconnecting', callback);
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();