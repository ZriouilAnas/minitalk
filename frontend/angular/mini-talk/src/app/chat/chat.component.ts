import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import {
  ChatMessage,
  User,
  TypingUser,
  MessageType,
} from '../models/chat.models';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messageForm: FormGroup;
  messages: ChatMessage[] = [];
  users: User[] = [];
  typingUsers: Set<string> = new Set();
  currentUser: string = '';
  selectedMessageType: MessageType = MessageType.NORMAL;
  messageTypes = MessageType;

  private subscriptions: Subscription = new Subscription();
  private typingTimeout: any;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private router: Router
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopTyping();
  }

  private setupSubscriptions(): void {
    // Listen for new messages
    this.subscriptions.add(
      this.chatService.onNewMessage().subscribe((message) => {
        this.messages.push(message);
        this.scrollToBottom();
      })
    );

    // Listen for message history (sent on connection)
    this.subscriptions.add(
      this.chatService.onMessageHistory().subscribe((messages) => {
        console.log('Received message history:', messages.length, 'messages');
        this.messages = messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.scrollToBottom();
      })
    );

    // Listen for more history (on request)
    this.subscriptions.add(
      this.chatService.onMoreHistory().subscribe((messages) => {
        console.log('Received more history:', messages.length, 'messages');
        const processedMessages = messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        // Prepend older messages to the beginning of the array
        this.messages = [...processedMessages, ...this.messages];
        // Keep scroll position relatively stable when adding messages at the top
        setTimeout(() => {
          if (this.messagesContainer) {
            const container = this.messagesContainer.nativeElement;
            container.scrollTop = container.scrollHeight - container.clientHeight - 100;
          }
        }, 50);
      })
    );

    // Listen for user updates
    this.subscriptions.add(
      this.chatService.onUsersUpdate().subscribe((users) => {
        this.users = users;
      })
    );

    // Listen for user join/leave events
    this.subscriptions.add(
      this.chatService.onUserJoined().subscribe((data) => {
        this.addSystemMessage(`${data.pseudo} joined the chat`);
      })
    );

    this.subscriptions.add(
      this.chatService.onUserLeft().subscribe((data) => {
        this.addSystemMessage(`${data.pseudo} left the chat`);
      })
    );

    // Listen for typing indicators
    this.subscriptions.add(
      this.chatService.onUserTyping().subscribe((data) => {
        if (data.isTyping) {
          this.typingUsers.add(data.pseudo);
        } else {
          this.typingUsers.delete(data.pseudo);
        }
      })
    );

    // Listen for errors
    this.subscriptions.add(
      this.chatService.onError().subscribe((error) => {
        console.error('Chat error:', error);
      })
    );

    // Listen for disconnection
    this.subscriptions.add(
      this.chatService.onDisconnect().subscribe((reason) => {
        this.router.navigate(['/login']);
      })
    );
  }

  private addSystemMessage(content: string): void {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      pseudo: 'System',
      content: content,
      type: MessageType.NORMAL,
      timestamp: new Date(),
      senderId: 'system',
    };
    this.messages.push(systemMessage);
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const content = this.messageForm.get('message')?.value.trim();

      this.chatService
        .sendMessage(content, this.selectedMessageType)
        .then(() => {
          this.messageForm.reset();
          this.stopTyping();
        })
        .catch((error) => {
          console.error('Failed to send message:', error);
        });
    }
  }

  onInputChange(): void {
    this.startTyping();
  }

  onInputFocus(): void {
    this.startTyping();
  }

  onInputBlur(): void {
    this.stopTyping();
  }

  startTyping(): void {
    this.chatService.startTyping();

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  stopTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.chatService.stopTyping();
  }

  setMessageType(type: MessageType): void {
    this.selectedMessageType = type;
  }

  logout(): void {
    this.chatService.disconnect();
    window.dispatchEvent(new CustomEvent('chat:logout'));
  }

  getTypingIndicatorText(): string {
    const typingArray = Array.from(this.typingUsers);
    if (typingArray.length === 0) return '';
    if (typingArray.length === 1) return `${typingArray[0]} is typing...`;
    if (typingArray.length === 2)
      return `${typingArray[0]} and ${typingArray[1]} are typing...`;
    return `${typingArray[0]} and ${
      typingArray.length - 1
    } others are typing...`;
  }

  getMessageTypeLabel(type: MessageType): string {
    const labels = {
      [MessageType.NORMAL]: '💬 Normal',
      [MessageType.IMPORTANT]: '⚠️ Important',
      [MessageType.URGENT]: '🚨 Urgent',
    };
    return labels[type] || '💬 Normal';
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.chatService.getSocketId();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getMessageClass(message: ChatMessage): string {
    const baseClass = this.isOwnMessage(message)
      ? 'message own'
      : 'message other';
    return `${baseClass} ${message.type}`;
  }

  getCharCount(): number {
    return this.messageForm.get('message')?.value?.length || 0;
  }

  loadMoreHistory(): void {
    this.chatService.requestMoreHistory(20);
  }
}
