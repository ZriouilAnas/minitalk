const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const sanitizeHtml = require("sanitize-html");
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Fallback transports
});

// Configuration
const MAX_MESSAGE_LENGTH = 500;
const MESSAGE_TYPES = {
  NORMAL: "normal",
  IMPORTANT: "important",
  URGENT: "urgent",
};
const HISTORY_MESSAGES_ON_CONNECT = 25; // Nombre de messages d'historique envoyés à la connexion

// Persistence file for message history
const HISTORY_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(HISTORY_DIR, 'messages.json');
let _saveTimer = null;
const SAVE_DEBOUNCE_MS = 300; // debounce writes to disk

// Store connected users
const connectedUsers = new Map();

// Store message history (in production, use a database)
const messageHistory = [];
const MAX_HISTORY_MESSAGES = 50; // Number of messages to keep in history

// Load history from disk if available
const loadHistoryFromFile = () => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return;
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Convert timestamp strings back to Date objects
      parsed.forEach((m) => {
        if (m && m.timestamp) {
          m.timestamp = new Date(m.timestamp);
        }
        messageHistory.push(m);
      });
      // Keep only the last MAX_HISTORY_MESSAGES
      while (messageHistory.length > MAX_HISTORY_MESSAGES) messageHistory.shift();
      console.log(`📂 Loaded ${messageHistory.length} messages from ${HISTORY_FILE}`);
    }
  } catch (err) {
    console.error('Failed to load history from file:', err);
  }
};

const saveHistoryToFile = () => {
  // debounce writes
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
      // Serialize dates to ISO strings
      const toSave = messageHistory.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp }));
      await fs.promises.writeFile(HISTORY_FILE, JSON.stringify(toSave, null, 2), 'utf8');
      // console.log(`Saved ${toSave.length} messages to ${HISTORY_FILE}`);
    } catch (err) {
      console.error('Failed to save history to file:', err);
    }
  }, SAVE_DEBOUNCE_MS);
};

// Initialize with some demo messages for testing
const initializeDemoMessages = () => {
  const demoMessages = [
    {
      id: "demo-1",
      pseudo: "System",
      content: "Bienvenue sur MiniTalk ! Cette application de chat en temps réel supporte les messages avec priorités.",
      type: "normal",
      timestamp: new Date(Date.now() - 60000 * 10), // 10 minutes ago
      senderId: "system",
    },
    {
      id: "demo-2", 
      pseudo: "Admin",
      content: "N'hésitez pas à tester les différents types de messages : Normal, Important et Urgent !",
      type: "important",
      timestamp: new Date(Date.now() - 60000 * 5), // 5 minutes ago
      senderId: "admin",
    },
    {
      id: "demo-3",
      pseudo: "Bot",
      content: "Les messages sont horodatés et vous pouvez voir qui est en train d'écrire 📝",
      type: "normal", 
      timestamp: new Date(Date.now() - 60000 * 2), // 2 minutes ago
      senderId: "bot",
    }
  ];

  demoMessages.forEach(msg => addMessageToHistory(msg));
  console.log(`📚 Initialized with ${demoMessages.length} demo messages`);
};

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  textFilter: function (text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
};

// Utility functions
const sanitizeInput = (input) => {
  return sanitizeHtml(input, sanitizeOptions).trim();
};

const validatePseudo = (pseudo) => {
  const sanitizedPseudo = sanitizeInput(pseudo);
  if (!sanitizedPseudo || sanitizedPseudo.length < 2) {
    throw new Error("Pseudo must be at least 2 characters long");
  }
  if (sanitizedPseudo.length > 20) {
    throw new Error("Pseudo must be less than 20 characters");
  }
  return sanitizedPseudo;
};

const validateMessage = (message, type) => {
  const sanitizedMessage = sanitizeInput(message);

  if (!sanitizedMessage) {
    throw new Error("Message cannot be empty");
  }

  if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message must be less than ${MAX_MESSAGE_LENGTH} characters`
    );
  }

  if (!Object.values(MESSAGE_TYPES).includes(type)) {
    throw new Error("Invalid message type");
  }

  return {
    content: sanitizedMessage,
    type: type,
  };
};

const getConnectedUsersList = () => {
  return Array.from(connectedUsers.values()).map((user) => ({
    id: user.id,
    pseudo: user.pseudo,
    joinedAt: user.joinedAt,
  }));
};

const broadcastUserList = () => {
  const usersList = getConnectedUsersList();
  io.emit("users:update", usersList);
};

const addMessageToHistory = (message) => {
  messageHistory.push(message);
  
  // Keep only the last N messages
  if (messageHistory.length > MAX_HISTORY_MESSAGES) {
    messageHistory.shift();
  }
  // Persist to disk (debounced)
  try {
    saveHistoryToFile();
  } catch (err) {
    console.error('Error scheduling saveHistoryToFile:', err);
  }
};

const getMessageHistory = (limit = 20) => {
  // Return the last N messages, or all if less than N
  const startIndex = Math.max(0, messageHistory.length - limit);
  // Return a shallow copy with timestamp serialized to ISO strings for transport
  return messageHistory.slice(startIndex).map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp }));
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(` New connection: ${socket.id}`);

  // Request pseudo from new connection
  socket.emit("auth:require-pseudo");

  // Handle user authentication with pseudo
  socket.on("auth:set-pseudo", (pseudoData) => {
    try {
      if (!pseudoData || !pseudoData.pseudo) {
        socket.emit("auth:error", "Pseudo is required");
        return;
      }

      const pseudo = validatePseudo(pseudoData.pseudo);

      // Check if pseudo is already taken
      const isPseudoTaken = Array.from(connectedUsers.values()).some(
        (user) => user.pseudo.toLowerCase() === pseudo.toLowerCase()
      );

      if (isPseudoTaken) {
        socket.emit("auth:error", "This pseudo is already taken");
        return;
      }

      // Store user information
      connectedUsers.set(socket.id, {
        id: socket.id,
        pseudo: pseudo,
        joinedAt: new Date(),
        isTyping: false,
      });

      // Send success confirmation
      socket.emit("auth:success", { pseudo });

      // Send message history to the newly connected user
      const history = getMessageHistory(HISTORY_MESSAGES_ON_CONNECT);
      if (history.length > 0) {
        socket.emit("message:history", history);
        console.log(` Sent ${history.length} messages from history to ${pseudo} (last ${HISTORY_MESSAGES_ON_CONNECT} messages)`);
      }

      // Notify all users about new connection
      socket.broadcast.emit("user:joined", {
        pseudo: pseudo,
        timestamp: new Date(),
        system: true,
      });

      // Broadcast updated user list
      broadcastUserList();

      console.log(` User ${pseudo} (${socket.id}) joined the chat`);
    } catch (error) {
      console.error(` Auth error for ${socket.id}:`, error.message);
      socket.emit("auth:error", error.message);
    }
  });

  // Handle incoming messages
  socket.on("message:send", (messageData, callback) => {
    try {
      const user = connectedUsers.get(socket.id);

      if (!user) {
        socket.emit("error", "You must set a pseudo before sending messages");
        return;
      }

      if (!messageData) {
        throw new Error("Message data is required");
      }

      const validatedMessage = validateMessage(
        messageData.content,
        messageData.type
      );

      const message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        pseudo: user.pseudo,
        content: validatedMessage.content,
        type: validatedMessage.type,
        timestamp: new Date(),
        senderId: socket.id,
      };

      // Acknowledge message receipt to sender
      if (callback) {
        callback({
          status: "sent",
          messageId: message.id,
          timestamp: message.timestamp,
        });
      }

      // Add message to history
      addMessageToHistory(message);

      // Broadcast message to all users
      io.emit("message:new", message);

      console.log(
        `💬 Message from ${user.pseudo}: ${validatedMessage.content}`
      );
    } catch (error) {
      console.error(` Message error from ${socket.id}:`, error.message);
      socket.emit("error", error.message);
      if (callback) {
        callback({ status: "error", error: error.message });
      }
    }
  });

  // Handle additional history requests
  socket.on("message:request-history", (requestData) => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit("error", "Authentication required");
        return;
      }

      const limit = Math.min(requestData?.limit || 20, 100); // Max 100 messages
      const history = getMessageHistory(limit);
      
      socket.emit("message:more-history", history);
      console.log(` Sent ${history.length} additional history messages to ${user.pseudo}`);
    } catch (error) {
      console.error(` History request error from ${socket.id}:`, error.message);
      socket.emit("error", error.message);
    }
  });

  // Handle typing indicators
  socket.on("user:typing", () => {
    const user = connectedUsers.get(socket.id);
    if (user && !user.isTyping) {
      user.isTyping = true;
      socket.broadcast.emit("user:typing", {
        pseudo: user.pseudo,
        isTyping: true,
      });
    }
  });

  socket.on("user:stop-typing", () => {
    const user = connectedUsers.get(socket.id);
    if (user && user.isTyping) {
      user.isTyping = false;
      socket.broadcast.emit("user:typing", {
        pseudo: user.pseudo,
        isTyping: false,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    const user = connectedUsers.get(socket.id);

    if (user) {
      connectedUsers.delete(socket.id);

      // Notify other users
      socket.broadcast.emit("user:left", {
        pseudo: user.pseudo,
        timestamp: new Date(),
        system: true,
      });

      // Broadcast updated user list
      broadcastUserList();

      console.log(
        ` User ${user.pseudo} (${socket.id}) disconnected: ${reason}`
      );
    } else {
      console.log(` Connection ${socket.id} disconnected: ${reason}`);
    }
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error(` Socket error for ${socket.id}:`, error);
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connectedUsers: connectedUsers.size,
    timestamp: new Date(),
  });
});

// Get server info
app.get("/info", (req, res) => {
  res.json({
    maxMessageLength: MAX_MESSAGE_LENGTH,
    messageTypes: MESSAGE_TYPES,
    connectedUsers: connectedUsers.size,
    messageHistory: messageHistory.length,
    historyMessagesOnConnect: HISTORY_MESSAGES_ON_CONNECT,
    maxHistoryMessages: MAX_HISTORY_MESSAGES,
    serverTime: new Date(),
  });
});

// Get message history (optional API endpoint)
app.get("/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 messages
  const history = getMessageHistory(limit);
  res.json({
    messages: history,
    count: history.length,
    total: messageHistory.length,
  });
});

// Serve a simple test page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Chat Server</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <h1>WebSocket Chat Server</h1>
        <div id="status" class="status">Checking server status...</div>
        <div>
            <h3>Endpoints:</h3>
            <ul>
                <li><a href="/health">/health</a> - Server health</li>
                <li><a href="/info">/info</a> - Server information</li>
            </ul>
        </div>
        <script>
            fetch('/health')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('status').className = 'status success';
                    document.getElementById('status').innerHTML = 
                        ' Server is running! Connected users: ' + data.connectedUsers;
                })
                .catch(err => {
                    document.getElementById('status').className = 'status error';
                    document.getElementById('status').innerHTML = 
                        ' Server error: ' + err.message;
                });
        </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on http://0.0.0.0:${PORT}`);
  console.log(` WebSocket chat server ready`);
  console.log(` Max message length: ${MAX_MESSAGE_LENGTH} characters`);
  console.log(` Message types: ${Object.values(MESSAGE_TYPES).join(", ")}`);
  console.log(` History messages on connect: ${HISTORY_MESSAGES_ON_CONNECT}`);
  console.log(` Max history messages stored: ${MAX_HISTORY_MESSAGES}`);
  // Load history from disk first
  loadHistoryFromFile();

  // Initialize demo messages only if history is empty
  if (messageHistory.length === 0) {
    initializeDemoMessages();
    // Force immediate save to create the file
    try {
      if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
      const toSave = messageHistory.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp }));
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(toSave, null, 2), 'utf8');
      console.log(`💾 Created ${HISTORY_FILE} with ${toSave.length} demo messages`);
    } catch (err) {
      console.error('Failed to create initial history file:', err);
    }
  }
});

// Handle server errors
server.on("error", (error) => {
  console.error(" Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.log(` Port ${PORT} is already in use. Try a different port:`);
    console.log(`   PORT=3001 npm start`);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n Shutting down server...");
  server.close(() => {
    console.log(" Server closed");
    process.exit(0);
  });
});

module.exports = { server, io, connectedUsers };
