import { useEffect, useRef, useState } from 'react';
import { UsersIcon, WifiIcon, XCircleIcon, SparklesIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { UltraModernMessageItem, SystemMessage } from './UltraModernMessageItem';
import { UltraModernMessageInput } from './UltraModernMessageInput';
import { UserList } from './UltraModernUserList';
import { HistorySeparator } from './HistorySeparator';
import { AnimatedBackground } from './AnimatedBackground';
import type { Message, User, TypingUser, MessageType, SystemMessage as SystemMessageType } from '../types';

interface ChatInterfaceProps {
  messages: (Message | SystemMessageType & { type: 'joined' | 'left' })[];
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

export function UltraModernChatInterface({
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
        {/* Modern Sidebar */}
        <UserList
          users={users}
          currentUser={currentUser}
          typingUsers={typingUsers}
          isVisible={showUserList}
          onToggle={() => setShowUserList(!showUserList)}
        />

        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col backdrop-blur-sm">
          {/* Ultra-modern Header */}
          <div className="relative glass-medium border-b border-white/10 px-6 py-4">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/20 via-[#0077b6]/10 to-[#00b4d8]/20 rounded-t-xl" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="lg:hidden p-2 rounded-xl glass-light hover:glass-medium transition-all duration-300 hover-scale group"
                >
                  <Bars3Icon className="w-6 h-6 text-white/80 group-hover:text-[#caf0f8]" />
                </button>
                
                <div className="flex items-center space-x-4">
                  {/* Logo with morphing background */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#03045e] to-[#00b4d8] rounded-2xl animate-morphing flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-black text-gradient-wave tracking-tight">
                      MiniTalk
                    </h1>
                    <div className="flex items-center space-x-3 mt-1">
                      {/* Animated status dot */}
                      <div className={`w-3 h-3 rounded-full pulse-dot ${
                        connectionStatus.connected ? 'bg-[#90e0ef]' : 
                        connectionStatus.attempting ? 'bg-[#caf0f8] animate-pulse' : 'bg-red-400'
                      }`} />
                      <span className="text-sm font-medium text-white/80">
                        {connectionStatus.connected 
                          ? `${users.length} voyageur${users.length !== 1 ? 's' : ''} connecté${users.length !== 1 ? 's' : ''}`
                          : connectionStatus.attempting 
                            ? 'Connexion en cours...' 
                            : 'Déconnecté'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Connection indicator with glow */}
                <div className="flex items-center space-x-3 px-4 py-2 glass-light rounded-full">
                  <div className={`
                    relative p-2 rounded-full transition-all duration-300
                    ${connectionStatus.connected ? 'bg-[#90e0ef]/20 text-[#90e0ef]' : 
                      connectionStatus.attempting ? 'bg-[#caf0f8]/20 text-[#caf0f8] animate-pulse' : 'bg-red-400/20 text-red-400'}
                  `}>
                    <WifiIcon className="w-5 h-5" />
                    {connectionStatus.connected && (
                      <div className="absolute inset-0 bg-[#90e0ef]/30 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-white/90 tracking-wide">
                    {currentUser}
                  </span>
                </div>

                {/* Disconnect button with hover glow */}
                <button
                  onClick={onDisconnect}
                  className="
                    p-3 rounded-full glass-light hover:glass-medium transition-all duration-300 
                    text-white/70 hover:text-red-400 hover-glow group
                  "
                  title="Se déconnecter"
                >
                  <XCircleIcon className="w-5 h-5 group-hover:animate-pulse" />
                </button>
              </div>
            </div>
          </div>

          {/* Connection Error Banner */}
          {showConnectionError && connectionStatus.error && (
            <div className="glass-medium border-b border-red-400/20 px-6 py-4 animate-slideInDown">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-400/20 rounded-full">
                  <XCircleIcon className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-sm text-red-200 font-medium flex-1">
                  Erreur de connexion: {connectionStatus.error}
                </p>
                <button
                  onClick={() => setShowConnectionError(false)}
                  className="p-1 rounded-lg hover:bg-red-400/20 text-red-400 hover:text-red-300 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center animate-fadeInScale">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] rounded-full animate-morphing" />
                    <div className="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <UsersIcon className="w-10 h-10 text-white/80" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Bienvenue dans l'Océan Digital
                  </h3>
                  <p className="text-white/70 text-lg">
                    Commencez une conversation et plongez dans l'expérience
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const showSeparator = index === historyMessageCount - 1 && historyMessageCount > 0;
                  
                  return (
                    <div key={'id' in message ? message.id : `system-${index}`} className="animate-fadeInScale">
                      {('system' in message) ? (
                        <SystemMessage
                          pseudo={message.pseudo}
                          timestamp={message.timestamp}
                          type={message.type}
                        />
                      ) : (
                        <UltraModernMessageItem
                          message={message}
                          isOwn={message.senderId === currentUser || message.pseudo === currentUser}
                          isDelivered={deliveredMessages.has(message.id)}
                        />
                      )}
                      
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

                {/* Modern Typing Indicators */}
                {activeTypingUsers.length > 0 && (
                  <div className="flex justify-start animate-slideInUp">
                    <div className="glass-medium border border-[#90e0ef]/20 px-6 py-3 rounded-3xl shadow-lg">
                      <div className="flex items-center space-x-4">
                        {/* Animated typing dots */}
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-[#90e0ef] rounded-full animate-bounce opacity-80" />
                          <div className="w-3 h-3 bg-[#90e0ef] rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.1s' }} />
                          <div className="w-3 h-3 bg-[#90e0ef] rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm font-medium text-white/90">
                          {activeTypingUsers.length === 1 
                            ? `${activeTypingUsers[0].pseudo} compose un message...`
                            : `${activeTypingUsers.length} personnes écrivent...`
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

          {/* Ultra-modern Message Input */}
          <UltraModernMessageInput
            onSendMessage={onSendMessage}
            onTyping={onTyping}
            onStopTyping={onStopTyping}
            disabled={!connectionStatus.connected}
          />
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #00b4d8, #90e0ef);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0077b6, #00b4d8);
        }
      `}</style>
    </div>
  );
}