import { useEffect, useRef, useState } from 'react';
import { UsersIcon, WifiIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { MessageItem, SystemMessage as SystemMessageComponent } from './MessageItem';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { HistorySeparator } from './HistorySeparator';
import { AnimatedBackground } from './AnimatedBackground';
import type { Message, User, TypingUser, MessageType, SystemMessage } from '../types';

interface ChatInterfaceProps {
  messages: (Message | SystemMessage & { type: 'joined' | 'left' })[];
  users: User[];
  currentUser: string;
  typingUsers: TypingUser[];
  connectionStatus: {
    connected: boolean;
    attempting: boolean;
    error?: string;
  };
  deliveredMessages: Set<string>;
  historyMessageCount: number;
  canLoadMoreHistory?: boolean;
  onSendMessage: (content: string, type: MessageType) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onDisconnect: () => void;
  onLoadMoreHistory?: () => Promise<void>;
}

export function ChatInterface({
  messages,
  users,
  currentUser,
  typingUsers,
  connectionStatus,
  deliveredMessages,
  historyMessageCount,
  canLoadMoreHistory = true,
  onSendMessage,
  onTyping,
  onStopTyping,
  onDisconnect,
  onLoadMoreHistory,
}: ChatInterfaceProps) {
  const [showUserList, setShowUserList] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle connection status
  useEffect(() => {
    if (connectionStatus.error) {
      setShowConnectionError(true);
    } else {
      setShowConnectionError(false);
    }
  }, [connectionStatus]);

  const activeTypingUsers = typingUsers.filter(user => user.isTyping && user.pseudo !== currentUser);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Ultra-modern animated background */}
      <AnimatedBackground variant="particles" intensity="light" />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-white/5 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative flex w-full h-full glass-light">
      {/* User List Sidebar */}
      <UserList
        users={users}
        currentUser={currentUser}
        typingUsers={typingUsers}
        isVisible={showUserList}
        onToggle={() => setShowUserList(!showUserList)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <UsersIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MiniTalk</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus.connected ? 'bg-green-500' : 
                    connectionStatus.attempting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span>
                    {connectionStatus.connected 
                      ? `${users.length} user${users.length !== 1 ? 's' : ''} online`
                      : connectionStatus.attempting 
                        ? 'Connecting...' 
                        : 'Disconnected'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection status indicator */}
              <div className="flex items-center space-x-2">
                <WifiIcon className={`w-5 h-5 ${
                  connectionStatus.connected ? 'text-green-600' : 
                  connectionStatus.attempting ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {currentUser}
                </span>
              </div>

              {/* Disconnect button */}
              <button
                onClick={onDisconnect}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
                title="Disconnect"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Connection Error Banner */}
        {showConnectionError && connectionStatus.error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">
                Connection error: {connectionStatus.error}
              </p>
              <button
                onClick={() => setShowConnectionError(false)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-1"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">Welcome to MiniTalk!</p>
                <p>Start a conversation by sending a message below.</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                // Show history separator after history messages
                const showSeparator = index === historyMessageCount - 1 && historyMessageCount > 0;
                
                return (
                  <div key={message.id || `system-${index}`}>
                    {('system' in message) ? (
                      // System message
                      <SystemMessageComponent
                        pseudo={message.pseudo}
                        timestamp={message.timestamp}
                        type={message.type}
                      />
                    ) : (
                      // Regular message
                      <MessageItem
                        message={message}
                        isOwn={message.senderId === currentUser || message.pseudo === currentUser}
                        isDelivered={deliveredMessages.has(message.id)}
                      />
                    )}
                    
                    {/* Show separator after last history message */}
                    {showSeparator && (
                      <HistorySeparator 
                        messageCount={historyMessageCount}
                        onLoadMore={onLoadMoreHistory}
                        canLoadMore={canLoadMoreHistory && historyMessageCount > 0}
                      />
                    )}
                  </div>
                );
              })}

              {/* Typing indicators */}
              {activeTypingUsers.length > 0 && (
                <div className="flex justify-start mb-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm font-medium">
                        {activeTypingUsers.length === 1 
                          ? `${activeTypingUsers[0].pseudo} écrit un message…`
                          : `${activeTypingUsers.length} personnes écrivent…`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          disabled={!connectionStatus.connected}
        />
        </div>
      </div>
    </div>
  );
}