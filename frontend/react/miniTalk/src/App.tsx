import { useState, useEffect } from 'react';
import { Authentication, UltraModernChatInterface, ConnectionLoader } from './components';
import { socketService } from './services/socket';
import type { Message, User, TypingUser, MessageType, SystemMessage } from './types';
import './styles/animations.css';

function App() {

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    attempting: false,
    error: undefined as string | undefined,
  });

  // Chat state
  const [messages, setMessages] = useState<(Message | SystemMessage & { type: 'joined' | 'left' })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [deliveredMessages, setDeliveredMessages] = useState<Set<string>>(new Set());
  const [historyMessageCount, setHistoryMessageCount] = useState(0);
  const [canLoadMoreHistory, setCanLoadMoreHistory] = useState(true);

  // Initialize socket connection and setup listeners
  useEffect(() => {
    const initializeConnection = async () => {
      setConnectionStatus(prev => ({ ...prev, attempting: true, error: undefined }));
      
      try {
        console.log('🔌 Connecting to server...');
        await socketService.connect();
        console.log('✅ Connected, setting up listeners...');
        
        // Setup socket event listeners
        socketService.onRequirePseudo(() => {
          console.log('Pseudo required');
        });

        socketService.onConnect(() => {
          console.log('Connected to server');
          setConnectionStatus(prev => ({ ...prev, connected: true, attempting: false, error: undefined }));
        });

        socketService.onDisconnect((reason) => {
          console.log('Disconnected:', reason);
          setConnectionStatus(prev => ({ ...prev, connected: false }));
        });

        socketService.onMessage((message) => {
          console.log('📨 New message:', message);
          setMessages(prev => [...prev, message]);
          
          // Mark message as delivered
          setDeliveredMessages(prev => new Set([...prev, message.id]));
        });

        socketService.onMessageHistory((historyMessages) => {
          console.log('📚 Received message history:', historyMessages.length, 'messages');
          setMessages(historyMessages);
          setHistoryMessageCount(historyMessages.length);
          
          // Mark all history messages as delivered
          const historyIds = historyMessages.map(msg => msg.id);
          setDeliveredMessages(prev => new Set([...prev, ...historyIds]));
        });

        socketService.onUserJoined((data) => {
          console.log('👋 User joined:', data);
          setMessages(prev => [...prev, { ...data, type: 'joined' as const }]);
        });

        socketService.onUserLeft((data) => {
          console.log('👋 User left:', data);
          setMessages(prev => [...prev, { ...data, type: 'left' as const }]);
        });

        socketService.onUsersUpdate((usersList) => {
          console.log('👥 Users updated:', usersList);
          setUsers(usersList);
        });

        socketService.onUserTyping((data) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.pseudo !== data.pseudo);
            if (data.isTyping) {
              return [...filtered, data];
            }
            return filtered;
          });
        });

        socketService.onError((error) => {
          console.error('Socket error:', error);
          setConnectionStatus(prev => ({ ...prev, error }));
        });

        setConnectionStatus(prev => ({ ...prev, connected: true, attempting: false }));
        
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnectionStatus({
          connected: false,
          attempting: false,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      console.log('🧹 App cleanup');
      socketService.disconnect();
    };
  }, []);

  // Show history notification when messages are loaded
  useEffect(() => {
    if (historyMessageCount > 0) {
      console.log(`📚 Historique chargé: ${historyMessageCount} message${historyMessageCount !== 1 ? 's' : ''} précédent${historyMessageCount !== 1 ? 's' : ''}`);
    }
  }, [historyMessageCount]);

  // Handle authentication
  const handleAuthentication = async (pseudo: string) => {
    setConnectionStatus(prev => ({ ...prev, attempting: true }));

    try {
      console.log('🔐 Authenticating with pseudo:', pseudo);
      
      // Ensure we're connected first
      if (!socketService.isConnected()) {
        console.log('Not connected, connecting first...');
        await socketService.connect();
      }
      
      const result = await socketService.setPseudo(pseudo);
      console.log('✅ Authentication successful:', result);
      
      setCurrentUser(result.pseudo);
      setIsAuthenticated(true);
      setConnectionStatus(prev => ({ ...prev, attempting: false, connected: true }));
    } catch (error) {
      console.error('Authentication failed:', error);
      setConnectionStatus(prev => ({ ...prev, attempting: false }));
    }
  };

  // Handle sending messages
  const handleSendMessage = async (content: string, type: MessageType) => {
    if (!isAuthenticated || !currentUser) {
      console.error('Cannot send message: not authenticated');
      return;
    }

    if (!connectionStatus.connected) {
      console.error('Cannot send message: not connected');
      return;
    }

    try {
      const acknowledgment = await socketService.sendMessage(content, type);
      console.log('Message sent:', acknowledgment);
      
      // Mark message as delivered
      if (acknowledgment.messageId) {
        setDeliveredMessages(prev => new Set([...prev, acknowledgment.messageId]));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      setConnectionStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      }));
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    socketService.startTyping();
  };

  const handleStopTyping = () => {
    socketService.stopTyping();
  };

  // Handle loading more history
  const handleLoadMoreHistory = async () => {
    if (!isAuthenticated || !connectionStatus.connected) {
      console.error('Cannot load history: not authenticated or not connected');
      return;
    }

    try {
      const moreMessages = await socketService.requestMoreHistory(50);
      
      if (moreMessages.length === 0) {
        setCanLoadMoreHistory(false);
        console.log('📚 Historique complet: tous les messages disponibles ont été chargés');
        return;
      }

      // Filter out messages we already have
      const existingIds = new Set(messages.map(msg => 'id' in msg ? msg.id : `system-${msg.timestamp}`));
      const newMessages = moreMessages.filter(msg => !existingIds.has(msg.id));
      
      if (newMessages.length > 0) {
        setMessages(prev => [...newMessages, ...prev]);
        
        // Mark all new messages as delivered
        const newMessageIds = newMessages.map(msg => msg.id);
        setDeliveredMessages(prev => new Set([...prev, ...newMessageIds]));
        
        console.log(`📚 Historique chargé: ${newMessages.length} message${newMessages.length !== 1 ? 's' : ''} supplémentaire${newMessages.length !== 1 ? 's' : ''}`);
      } else {
        console.log('📚 Aucun nouveau message: tous les messages récents sont déjà affichés');
      }
      
      // If we got fewer messages than requested, we've reached the end
      if (moreMessages.length < 50) {
        setCanLoadMoreHistory(false);
      }
      
    } catch (error) {
      console.error('Failed to load more history:', error);
      console.log('❌ Erreur: Impossible de charger plus de messages');
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    console.log('👋 User initiated disconnect');
    socketService.disconnect();
    setIsAuthenticated(false);
    setCurrentUser('');
    setMessages([]);
    setUsers([]);
    setTypingUsers([]);
    setDeliveredMessages(new Set());
    setHistoryMessageCount(0);
    setCanLoadMoreHistory(true);
    setConnectionStatus({ connected: false, attempting: false, error: undefined });
  };

  // Show connection status while connecting or if there's an error
  if (connectionStatus.attempting || (connectionStatus.error && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex items-center justify-center p-4">
        <ConnectionLoader />
        {connectionStatus.error && (
          <div className="mt-4 p-4 glass-light rounded-2xl border border-red-500/30 text-red-300 text-center">
            {connectionStatus.error}
          </div>
        )}
      </div>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Authentication
        onLogin={handleAuthentication}
        isConnecting={connectionStatus.attempting}
      />
    );
  }

  // Show main chat interface
  return (
    <>
      <UltraModernChatInterface
        messages={messages}
        users={users}
        currentUser={currentUser}
        typingUsers={typingUsers}
        connectionStatus={connectionStatus}
        deliveredMessages={deliveredMessages}
        historyMessageCount={historyMessageCount}
        canLoadMoreHistory={canLoadMoreHistory}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        onDisconnect={handleDisconnect}
        onLoadMoreHistory={handleLoadMoreHistory}
      />
    </>
  );
}

export default App;
