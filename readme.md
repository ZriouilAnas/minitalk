# MiniTalk - Real-time Chat Application

MiniTalk is a modern, WhatsApp-style real-time chat application built with React and Socket.IO. It provides a complete chat experience with authentication, real-time messaging, user management, and advanced features like message priorities and typing indicators.

## ✨ Features

### 🔐 Authentication
- **Simple pseudo-based authentication** - Users choose a unique username
- **Modern styling** with Tailwind CSS
- **Input validation** with real-time feedback
- **Duplicate username prevention**

### 💬 Real-time Messaging
- **Instant message delivery** via WebSocket connections
- **Message timestamps** with precise time formatting
- **Message priorities**: Normal, Important, Urgent
- **Custom message colors** based on priority levels
- **Message acknowledgment** with delivery confirmations
- **Character limit** (500 characters) with live counter

### 👥 User Management
- **Real-time user list** showing all connected users
- **Online status indicators** with green dots
- **User join/leave notifications** as system messages
- **User avatars** with initials and color coding
- **Current user highlighting**

### ⌨️ Typing Indicators
- **"User is typing..."** indicators in real-time
- **Multiple users typing** with smart aggregation
- **Auto-timeout** after 1 second of inactivity
- **Visual typing animations** with bouncing dots

### 🔄 Connection Management
- **Automatic reconnection** after connection loss
- **Connection status indicators** (Connected/Connecting/Disconnected)
- **Graceful error handling** with user-friendly messages
- **Manual disconnect** option with cleanup
- **Progressive reconnection** with exponential backoff

### 🎨 Modern UI/UX
- **WhatsApp-inspired design** with modern aesthetics
- **Responsive layout** for mobile and desktop
- **Smooth animations** and transitions
- **Dark/light message bubbles** for own vs others' messages
- **Priority message styling** with borders and colors
- **Auto-scrolling** to latest messages
- **Collapsible sidebar** on mobile devices

## 🛠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for modern styling
- **Socket.IO Client** for real-time communication
- **Heroicons** for beautiful icons
- **date-fns** for date formatting
- **Vite** for fast development and builds

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket management
- **HTML sanitization** for security
- **CORS enabled** for cross-origin requests
- **Graceful error handling**

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minitalk
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/react/minitalk
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   node index.js
   ```
   The server will start on `http://localhost:3000`

2. **Start the React frontend**
   ```bash
   cd frontend/react/minitalk
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open multiple browser tabs** to test the chat functionality

## 📱 Usage

### Getting Started
1. **Enter your username** on the authentication screen
2. **Click "Join Chat"** to connect to the chat room
3. **Start messaging** immediately with other connected users

### Sending Messages
1. **Type your message** in the input field at the bottom
2. **Choose message priority** (Normal/Important/Urgent) using the dropdown
3. **Press Enter** to send or **Shift+Enter** for new lines
4. **Watch for delivery confirmations** (checkmarks for your messages)

### User Interaction
- **View online users** in the sidebar (click the users icon on mobile)
- **See typing indicators** when others are composing messages
- **Monitor connection status** in the header
- **Disconnect gracefully** using the disconnect button

## 🔧 Configuration

### Backend Configuration
Edit `backend/index.js` to modify:
- **Server port** (default: 3000)
- **CORS settings** for different origins
- **Message length limits** (default: 500 characters)
- **Reconnection parameters**

### Frontend Configuration
Edit `src/services/socket.ts` to modify:
- **Server URL** (default: http://localhost:3000)
- **Reconnection attempts** (default: 5)
- **Reconnection delays**

## 🏗 Architecture

### Component Structure
```
src/
├── components/
│   ├── Authentication.tsx      # Login/pseudo setup
│   ├── ChatInterface.tsx       # Main chat container
│   ├── MessageItem.tsx         # Individual message display
│   ├── MessageInput.tsx        # Message composition
│   ├── UserList.tsx           # Online users sidebar
│   └── LoadingSpinner.tsx     # Loading states
├── services/
│   └── socket.ts              # WebSocket service
├── types/
│   └── index.ts               # TypeScript definitions
└── App.tsx                    # Main application component
```

### Socket Events

#### Client → Server
- `auth:set-pseudo` - Set username
- `message:send` - Send message
- `user:typing` - Start typing indicator
- `user:stop-typing` - Stop typing indicator

#### Server → Client
- `auth:require-pseudo` - Request username
- `auth:success` - Authentication successful
- `auth:error` - Authentication failed
- `message:new` - New message received
- `user:joined` - User joined notification
- `user:left` - User left notification
- `users:update` - Updated user list
- `user:typing` - Typing indicator update

## 🔒 Security Features

- **Input sanitization** on both client and server
- **XSS protection** with HTML sanitization
- **Username validation** with length and character restrictions
- **Message length limits** to prevent spam
- **Connection rate limiting** (configurable)

## 📱 Responsive Design

- **Mobile-first approach** with responsive breakpoints
- **Collapsible sidebar** for mobile devices
- **Touch-friendly interfaces** with appropriate button sizes
- **Optimized layouts** for different screen sizes

## 🎯 Message Priority System

### Normal Messages
- Default priority level
- Green color scheme for sender
- Standard styling

### Important Messages
- Amber/yellow color scheme
- Warning icon indicator
- Highlighted border

### Urgent Messages
- Red color scheme
- Fire icon indicator
- Animated border (pulse effect)
- Priority positioning

## 🔄 Connection Resilience

- **Automatic reconnection** with exponential backoff
- **Connection state management** with visual indicators
- **Graceful degradation** when offline
- **Message queuing** during reconnection (planned feature)
- **Error recovery** with user notifications

## 🚀 Performance Optimizations

- **React.memo** for component optimization
- **useCallback** for event handler stability
- **Efficient re-renders** with proper dependency arrays
- **Message virtualization** (for large chat histories)
- **Lazy loading** of components
- **Optimized bundle size** with tree shaking

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test real-time features:
1. Open multiple browser windows
2. Join with different usernames
3. Test messaging between windows
4. Test connection loss/recovery
5. Verify typing indicators

## 📋 Roadmap

- [ ] **Message history persistence** with database
- [ ] **File sharing** capabilities
- [ ] **Emoji picker** and reactions
- [ ] **Private messaging** between users
- [ ] **Chat rooms/channels**
- [ ] **Message search** functionality
- [ ] **Push notifications**
- [ ] **Voice messages**
- [ ] **User profiles** with avatars
- [ ] **Message encryption**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular messaging applications
- Focused on user experience and performance
