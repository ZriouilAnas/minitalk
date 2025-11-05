import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import {
  ChatMessage,
  User,
  TypingUser,
  AuthData,
  MessageType,
} from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private readonly serverUrl = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
    });
  }

  // Connection events
  onConnect(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('connect', () => observer.next());
    });
  }

  onDisconnect(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('disconnect', (reason) => observer.next(reason));
    });
  }

  onConnectError(): Observable<Error> {
    return new Observable((observer) => {
      this.socket.on('connect_error', (error) => observer.next(error));
    });
  }

  // Authentication
  onAuthRequire(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('auth:require-pseudo', () => observer.next());
    });
  }

  onAuthSuccess(): Observable<AuthData> {
    return new Observable((observer) => {
      this.socket.on('auth:success', (data) => observer.next(data));
    });
  }

  onAuthError(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('auth:error', (error) => observer.next(error));
    });
  }

  setPseudo(pseudo: string): void {
    this.socket.emit('auth:set-pseudo', { pseudo });
  }

  // Messages
  onNewMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      this.socket.on('message:new', (message) => observer.next(message));
    });
  }

  onMessageHistory(): Observable<ChatMessage[]> {
    return new Observable((observer) => {
      this.socket.on('message:history', (messages) => observer.next(messages));
    });
  }

  onMoreHistory(): Observable<ChatMessage[]> {
    return new Observable((observer) => {
      this.socket.on('message:more-history', (messages) => observer.next(messages));
    });
  }

  requestMoreHistory(limit: number = 20): void {
    this.socket.emit('message:request-history', { limit });
  }

  sendMessage(
    content: string,
    type: MessageType
  ): Promise<{ status: string; messageId: string; timestamp: Date }> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:send', { content, type }, (response: any) => {
        if (response.status === 'sent') {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }

  // Users
  onUsersUpdate(): Observable<User[]> {
    return new Observable((observer) => {
      this.socket.on('users:update', (users) => observer.next(users));
    });
  }

  onUserJoined(): Observable<{
    pseudo: string;
    timestamp: Date;
    system: boolean;
  }> {
    return new Observable((observer) => {
      this.socket.on('user:joined', (data) => observer.next(data));
    });
  }

  onUserLeft(): Observable<{
    pseudo: string;
    timestamp: Date;
    system: boolean;
  }> {
    return new Observable((observer) => {
      this.socket.on('user:left', (data) => observer.next(data));
    });
  }

  // Typing indicators
  onUserTyping(): Observable<TypingUser> {
    return new Observable((observer) => {
      this.socket.on('user:typing', (data) => observer.next(data));
    });
  }

  startTyping(): void {
    this.socket.emit('user:typing');
  }

  stopTyping(): void {
    this.socket.emit('user:stop-typing');
  }

  // Error handling
  onError(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('error', (error) => observer.next(error));
    });
  }

  // Connection management
  disconnect(): void {
    this.socket.disconnect();
  }

  connect(): void {
    this.socket.connect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  getSocketId(): string | undefined {
    return this.socket.id;
  }
}
