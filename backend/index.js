const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const sanitizeHtml = require("sanitize-html");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Configuration
const MAX_MESSAGE_LENGTH = 500;
const MESSAGE_TYPES = {
  NORMAL: "normal",
  IMPORTANT: "important",
  URGENT: "urgent",
};

// Store connected users
const connectedUsers = new Map();

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  textFilter: function (text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Request pseudo from new connection
  socket.emit("auth:require-pseudo");

  // Handle user authentication with pseudo
  socket.on("auth:set-pseudo", (pseudoData) => {
    try {
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

      // Notify all users about new connection
      socket.broadcast.emit("user:joined", {
        pseudo: pseudo,
        timestamp: new Date(),
        system: true,
      });

      // Broadcast updated user list
      broadcastUserList();

      console.log(`User ${pseudo} (${socket.id}) joined the chat`);
    } catch (error) {
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

      // Broadcast message to all users
      io.emit("message:new", message);

      console.log(`Message from ${user.pseudo}: ${validatedMessage.content}`);
    } catch (error) {
      socket.emit("error", error.message);
      if (callback) {
        callback({ status: "error", error: error.message });
      }
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

  // Handle message read receipts
  socket.on("message:read", (messageId) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit("message:read-receipt", {
        messageId: messageId,
        readBy: user.pseudo,
        timestamp: new Date(),
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

      console.log(`User ${user.pseudo} (${socket.id}) disconnected: ${reason}`);
    }
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
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
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket chat server ready`);
  console.log(`Max message length: ${MAX_MESSAGE_LENGTH} characters`);
  console.log(
    `Available message types: ${Object.values(MESSAGE_TYPES).join(", ")}`
  );
});

module.exports = { server, io, connectedUsers };
