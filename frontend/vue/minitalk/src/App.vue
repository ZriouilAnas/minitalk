<template>
  <div id="app">
    <!-- Login Screen -->
    <div v-if="!currentUser" class="login-screen">
      <div class="login-box">
        <h1>💬 MiniTalk</h1>
        <div
          :class="[
            'connection-status',
            isConnected ? 'connected' : 'disconnected',
          ]"
        >
          {{ isConnected ? "✅ Connected" : "❌ Disconnected" }}
        </div>

        <input
          type="text"
          v-model="pseudoInput"
          placeholder="Enter your name (2-20 characters)"
          @keyup.enter="login"
          class="name-input"
        />

        <button @click="login" class="login-btn">Join Chat</button>

        <div v-if="errorMessage" class="error">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Chat Screen -->
    <div v-else class="chat-screen">
      <div class="chat-header">
        <h2>MiniTalk</h2>
        <div class="user-info">
          Welcome, {{ currentUser }}
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>

      <div class="chat-container">
        <!-- Sidebar -->
        <div class="sidebar">
          <h3>👥 Online Users ({{ users.length }})</h3>
          <div class="users-list">
            <div v-for="user in users" :key="user.id" class="user-item">
              {{ user.pseudo }}
            </div>
          </div>
        </div>

        <!-- Main Chat -->
        <div class="main-chat">
          <div class="messages" ref="messagesContainer">
            <!-- Load More History Button -->
            <div v-if="messages.length > 0" class="load-more-container">
              <button @click="loadMoreHistory" class="load-more-btn">
                📜 Load older messages
              </button>
            </div>

            <div
              v-for="message in messages"
              :key="message.id"
              :class="['message', getMessageClass(message), message.type]"
            >
              <div v-if="!message.system" class="message-header">
                <strong>{{ message.pseudo }}</strong>
                <span class="message-type">{{
                  getTypeLabel(message.type)
                }}</span>
              </div>

              <div class="message-content">{{ message.content }}</div>

              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="typingUsers.size > 0" class="typing">
            {{ getTypingText() }}
          </div>

          <!-- Message Input -->
          <div class="input-area">
            <div class="type-buttons">
              <button
                v-for="type in messageTypes"
                :key="type"
                @click="selectedType = type"
                :class="['type-btn', type, { active: selectedType === type }]"
              >
                {{ getTypeLabel(type) }}
              </button>
            </div>

            <div class="input-group">
              <input
                type="text"
                v-model="messageInput"
                placeholder="Type your message..."
                @keyup.enter="sendMessage"
                @input="onTyping"
                maxlength="500"
                class="message-input"
              />

              <button
                @click="sendMessage"
                :disabled="!messageInput.trim()"
                class="send-btn"
              >
                Send
              </button>
            </div>

            <div class="char-count">{{ messageInput.length }}/500</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { io } from "socket.io-client";

// State
const socket = ref(null);
const currentUser = ref("");
const isConnected = ref(false);
const errorMessage = ref("");

const pseudoInput = ref("");
const messageInput = ref("");

const messages = ref([]);
const users = ref([]);
const typingUsers = ref(new Set());

const messageTypes = ["normal", "important", "urgent"];
const selectedType = ref("normal");

const messagesContainer = ref(null);

let typingTimeout = null;

// Methods
const connect = () => {
  socket.value = io("http://localhost:3000");

  socket.value.on("connect", () => {
    isConnected.value = true;
    console.log("Connected to server");
  });

  socket.value.on("disconnect", () => {
    isConnected.value = false;
    console.log("Disconnected from server");
  });

  socket.value.on("connect_error", (error) => {
    errorMessage.value =
      "Cannot connect to server. Make sure backend is running on port 3000.";
    console.error("Connection error:", error);
  });

  // Authentication
  socket.value.on("auth:require-pseudo", () => {
    console.log("Server requires pseudo");
  });

  socket.value.on("auth:success", (data) => {
    currentUser.value = data.pseudo;
    errorMessage.value = "";
  });

  socket.value.on("auth:error", (error) => {
    errorMessage.value = error;
  });

  // Messages
  socket.value.on("message:new", (message) => {
    messages.value.push(message);
    scrollToBottom();
  });

  // Message history (sent on connection)
  socket.value.on("message:history", (historyMessages) => {
    console.log('Received message history:', historyMessages.length, 'messages');
    messages.value = historyMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    scrollToBottom();
  });

  // More history (on request)
  socket.value.on("message:more-history", (historyMessages) => {
    console.log('Received more history:', historyMessages.length, 'messages');
    const processedMessages = historyMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    
    // Prepend older messages to the beginning of the array
    messages.value = [...processedMessages, ...messages.value];
    // Keep scroll position relatively stable when adding messages at the top
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - messagesContainer.value.clientHeight - 100;
      }
    });
  });

  // Users
  socket.value.on("users:update", (userList) => {
    users.value = userList;
  });

  socket.value.on("user:joined", (data) => {
    addSystemMessage(`${data.pseudo} joined the chat`);
  });

  socket.value.on("user:left", (data) => {
    addSystemMessage(`${data.pseudo} left the chat`);
  });

  // Typing
  socket.value.on("user:typing", (data) => {
    if (data.isTyping) {
      typingUsers.value.add(data.pseudo);
    } else {
      typingUsers.value.delete(data.pseudo);
    }
  });

  // Errors
  socket.value.on("error", (error) => {
    errorMessage.value = error;
  });
};

const login = () => {
  if (!pseudoInput.value || pseudoInput.value.length < 2) {
    errorMessage.value = "Name must be at least 2 characters";
    return;
  }

  socket.value.emit("auth:set-pseudo", { pseudo: pseudoInput.value });
};

const logout = () => {
  socket.value.disconnect();
  currentUser.value = "";
  messages.value = [];
  users.value = [];
  typingUsers.value.clear();
  pseudoInput.value = "";
  connect(); // Reconnect
};

const sendMessage = () => {
  if (!messageInput.value.trim()) return;

  socket.value.emit(
    "message:send",
    {
      content: messageInput.value.trim(),
      type: selectedType.value,
    },
    (response) => {
      if (response.status === "sent") {
        messageInput.value = "";
        stopTyping();
      } else {
        errorMessage.value = response.error || "Failed to send message";
      }
    }
  );
};

const onTyping = () => {
  socket.value.emit("user:typing");

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 1000);
};

const stopTyping = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  socket.value.emit("user:stop-typing");
};

const addSystemMessage = (content) => {
  const systemMessage = {
    id: Date.now().toString(),
    pseudo: "System",
    content: content,
    type: "normal",
    timestamp: new Date(),
    system: true,
  };
  messages.value.push(systemMessage);
  scrollToBottom();
};

const getMessageClass = (message) => {
  if (message.system) return "system";
  if (message.senderId === socket.value?.id) return "own";
  return "other";
};

const getTypeLabel = (type) => {
  const labels = {
    normal: "💬 Normal",
    important: "⚠️ Important",
    urgent: "🚨 Urgent",
  };
  return labels[type] || "💬 Normal";
};

const getTypingText = () => {
  const usersArray = Array.from(typingUsers.value);
  if (usersArray.length === 0) return "";
  if (usersArray.length === 1) return `${usersArray[0]} is typing...`;
  if (usersArray.length === 2)
    return `${usersArray[0]} and ${usersArray[1]} are typing...`;
  return `${usersArray[0]} and ${usersArray.length - 1} others are typing...`;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const loadMoreHistory = () => {
  socket.value.emit("message:request-history", { limit: 20 });
};

// Lifecycle
onMounted(() => {
  connect();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f0f2f5;
  height: 100vh;
}

#app {
  height: 100vh;
}

/* Login Screen */
.login-screen {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 300px;
}

.login-box h1 {
  margin-bottom: 20px;
  color: #333;
}

.connection-status {
  padding: 8px 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
}

.connected {
  background: #d4edda;
  color: #155724;
}

.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.name-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 15px;
}

.name-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.login-btn:hover {
  background: #45a049;
}

.error {
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
}

/* Chat Screen */
.chat-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: #2c3e50;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  font-size: 1.5em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  padding: 8px 15px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}

.chat-container {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: white;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #34495e;
  color: white;
  padding: 20px;
  border-right: 1px solid #ddd;
}

.sidebar h3 {
  margin-bottom: 15px;
  font-size: 1.1em;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-item::before {
  content: "●";
  color: #2ecc71;
  font-size: 12px;
}

/* Main Chat */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  margin-bottom: 15px;
  padding: 12px 15px;
  border-radius: 10px;
  max-width: 70%;
  word-wrap: break-word;
}

.message.system {
  max-width: 100%;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  background: transparent;
}

.message.own {
  margin-left: auto;
  background: #007bff;
  color: white;
}

.message.other {
  background: white;
  border: 1px solid #e0e0e0;
  color: #333;
}

.message.normal {
  border-left: 4px solid #007bff;
}

.message.important {
  border-left: 4px solid #ffc107;
}

.message.important.other {
  background: #fff3cd;
  color: #856404;
}

.message.urgent {
  border-left: 4px solid #dc3545;
}

.message.urgent.other {
  background: #f8d7da;
  color: #721c24;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.85em;
  opacity: 0.9;
}

.message-content {
  line-height: 1.4;
  margin-bottom: 5px;
}

.message-time {
  font-size: 0.75em;
  opacity: 0.7;
  text-align: right;
}

.typing {
  padding: 10px 20px;
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
  min-height: 20px;
}

/* Message Input */
.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.type-buttons {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.type-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.3s;
}

.type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.type-btn.active.important {
  background: #ffc107;
  border-color: #ffc107;
}

.type-btn.active.urgent {
  background: #dc3545;
  border-color: #dc3545;
}

.input-group {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.char-count {
  text-align: right;
  margin-top: 5px;
  font-size: 0.8em;
  color: #6c757d;
}

/* Load More Button */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.load-more-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
  opacity: 0.8;
}

.load-more-btn:hover {
  background: #5a6268;
  opacity: 1;
  transform: translateY(-1px);
}

/* Scrollbar */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 150px;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .message {
    max-width: 85%;
  }
}
</style>
