import { useState, useEffect } from 'react';
import { socketService } from './services/socket';
import type { Message, User } from './types';

function TestApp() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [pseudo, setPseudo] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const connectAndSetup = async () => {
      try {
        setConnectionStatus('connecting');
        await socketService.connect();
        setConnectionStatus('connected');

        // Setup listeners
        socketService.onMessage((msg) => {
          console.log('📨 New message:', msg);
          setMessages(prev => [...prev, msg]);
        });

        socketService.onUsersUpdate((usersList) => {
          console.log('👥 Users updated:', usersList);
          setUsers(usersList);
        });

        socketService.onConnect(() => {
          console.log('✅ Socket connected');
          setConnectionStatus('connected');
        });

        socketService.onDisconnect((reason) => {
          console.log('🔌 Socket disconnected:', reason);
          setConnectionStatus('disconnected');
        });

      } catch (error) {
        console.error('❌ Connection failed:', error);
        setConnectionStatus('error');
      }
    };

    connectAndSetup();

    return () => {
      console.log('🧹 Cleanup - disconnecting socket');
      socketService.disconnect();
    };
  }, []);

  const handleAuth = async () => {
    if (!pseudo.trim()) return;
    
    try {
      console.log('🔐 Authenticating with pseudo:', pseudo);
      const result = await socketService.setPseudo(pseudo);
      console.log('✅ Auth successful:', result);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Auth failed:', error);
      alert('Authentication failed: ' + (error as Error).message);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      console.log('📤 Sending message:', message);
      const result = await socketService.sendMessage(message, 'normal');
      console.log('✅ Message sent:', result);
      setMessage('');
    } catch (error) {
      console.error('❌ Send failed:', error);
      alert('Send failed: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MiniTalk Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection Status:</strong> 
        <span style={{ 
          color: connectionStatus === 'connected' ? 'green' : 
                connectionStatus === 'connecting' ? 'orange' : 'red' 
        }}>
          {connectionStatus}
        </span>
      </div>

      {!isAuthenticated ? (
        <div style={{ marginBottom: '20px' }}>
          <h3>Authentication</h3>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Enter your pseudo"
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button onClick={handleAuth} style={{ padding: '8px 16px' }}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <h3>Welcome, {pseudo}!</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Send Message</h4>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              style={{ padding: '8px', marginRight: '10px', width: '300px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} style={{ padding: '8px 16px' }}>
              Send
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h4>Messages ({messages.length})</h4>
              <div style={{ 
                border: '1px solid #ccc', 
                height: '300px', 
                overflow: 'auto', 
                padding: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <strong>{msg.pseudo}:</strong> {msg.content}
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()} | {msg.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: '200px' }}>
              <h4>Online Users ({users.length})</h4>
              <div style={{ 
                border: '1px solid #ccc', 
                height: '300px', 
                overflow: 'auto', 
                padding: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                {users.map((user, index) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    {user.pseudo} {user.pseudo === pseudo && '(You)'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestApp;