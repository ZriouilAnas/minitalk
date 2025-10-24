class ChatApp {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.currentMessageType = "normal";
    this.typingTimeout = null;
    this.serverUrl = "http://localhost:3000";

    this.initializeElements();
    this.initializeEventListeners();
    this.connectToServer();
  }

  initializeElements() {
    // Screens
    this.loginScreen = document.getElementById("loginScreen");
    this.chatScreen = document.getElementById("chatScreen");

    // Login elements
    this.loginForm = document.getElementById("loginForm");
    this.pseudoInput = document.getElementById("pseudoInput");
    this.loginError = document.getElementById("loginError");
    this.serverUrlSpan = document.getElementById("serverUrl");
    this.statusIndicator = document.getElementById("statusIndicator");
    this.statusText = document.getElementById("statusText");

    // Chat elements
    this.currentUserSpan = document.getElementById("currentUser");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.usersList = document.getElementById("usersList");
    this.userCount = document.getElementById("userCount");
    this.messagesContainer = document.getElementById("messagesContainer");
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.charCount = document.getElementById("charCount");
    this.typingIndicator = document.getElementById("typingIndicator");

    // Message type buttons
    this.typeButtons = document.querySelectorAll(".type-btn");
  }

  initializeEventListeners() {
    // Login form
    this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));

    // Logout button
    this.logoutBtn.addEventListener("click", () => this.handleLogout());

    // Message input
    this.messageInput.addEventListener("input", () => this.handleInputChange());
    this.messageInput.addEventListener("keypress", (e) =>
      this.handleKeyPress(e)
    );
    this.messageInput.addEventListener("focus", () => this.startTyping());
    this.messageInput.addEventListener("blur", () => this.stopTyping());

    // Send button
    this.sendBtn.addEventListener("click", () => this.sendMessage());

    // Message type buttons
    this.typeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.setMessageType(e.target.dataset.type)
      );
    });
  }

  connectToServer() {
    this.updateConnectionStatus("connecting", "Connecting...");

    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to server");
      this.updateConnectionStatus("connected", "Connected");
      this.showLogin();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.updateConnectionStatus("disconnected", "Disconnected");
      this.showError("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      this.updateConnectionStatus("disconnected", "Connection Failed");
      this.showError(
        "Failed to connect to server. Make sure the backend is running on port 3000."
      );
    });

    // Authentication events
    this.socket.on("auth:require-pseudo", () => {
      console.log("🔐 Server requires pseudo");
    });

    this.socket.on("auth:success", (data) => {
      this.currentUser = data.pseudo;
      this.showChat();
    });

    this.socket.on("auth:error", (error) => {
      this.showError(error);
    });

    // Chat events
    this.socket.on("message:new", (message) => {
      this.displayMessage(message);
      this.scrollToBottom();
    });

    this.socket.on("users:update", (users) => {
      this.updateUsersList(users);
    });

    this.socket.on("user:joined", (data) => {
      this.displaySystemMessage(`${data.pseudo} joined the chat`);
    });

    this.socket.on("user:left", (data) => {
      this.displaySystemMessage(`${data.pseudo} left the chat`);
    });

    this.socket.on("user:typing", (data) => {
      this.showTypingIndicator(data);
    });

    this.socket.on("error", (error) => {
      this.showError(error);
    });
  }

  updateConnectionStatus(status, text) {
    const statusClass = `status-${status}`;
    this.statusIndicator.className = statusClass;
    this.statusText.textContent = text;
  }

  handleLogin(e) {
    e.preventDefault();
    const pseudo = this.pseudoInput.value.trim();

    if (pseudo.length < 2) {
      this.showError("Pseudo must be at least 2 characters long");
      return;
    }

    this.socket.emit("auth:set-pseudo", { pseudo });
  }

  handleLogout() {
    this.socket.disconnect();
    this.currentUser = null;
    this.showLogin();
    this.connectToServer(); // Reconnect for new login
  }

  handleInputChange() {
    const length = this.messageInput.value.length;
    this.charCount.textContent = `${length}/500`;

    // Enable/disable send button
    this.sendBtn.disabled = length === 0 || length > 500;

    // Handle typing indicator
    this.startTyping();
  }

  handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  startTyping() {
    this.socket.emit("user:typing");

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set new timeout to stop typing
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  stopTyping() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.socket.emit("user:stop-typing");
  }

  sendMessage() {
    const content = this.messageInput.value.trim();

    if (!content || content.length > 500) {
      return;
    }

    this.socket.emit(
      "message:send",
      {
        content: content,
        type: this.currentMessageType,
      },
      (ack) => {
        if (ack.status === "sent") {
          this.messageInput.value = "";
          this.charCount.textContent = "0/500";
          this.sendBtn.disabled = true;
          this.stopTyping();
        } else {
          this.showError(ack.error || "Failed to send message");
        }
      }
    );
  }

  setMessageType(type) {
    this.currentMessageType = type;

    // Update button states
    this.typeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });
  }

  displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${
      message.senderId === this.socket.id ? "own" : "other"
    } ${message.type}`;

    const time = new Date(message.timestamp).toLocaleTimeString();

    messageElement.innerHTML = `
            <div class="message-header">
                <strong>${message.pseudo}</strong>
                <span>${this.getMessageTypeLabel(message.type)}</span>
            </div>
            <div class="message-content">${this.escapeHtml(
              message.content
            )}</div>
            <div class="message-time">${time}</div>
        `;

    this.messagesContainer.appendChild(messageElement);
  }

  displaySystemMessage(content) {
    const messageElement = document.createElement("div");
    messageElement.className = "message system-message";
    messageElement.textContent = content;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  showTypingIndicator(data) {
    if (data.isTyping && data.pseudo !== this.currentUser) {
      this.typingIndicator.textContent = `${data.pseudo} is typing...`;
    } else {
      this.typingIndicator.textContent = "";
    }
  }

  updateUsersList(users) {
    this.usersList.innerHTML = "";
    this.userCount.textContent = users.length;

    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.className = "user-item";
      userElement.innerHTML = `
                <span>${this.escapeHtml(user.pseudo)}</span>
            `;
      this.usersList.appendChild(userElement);
    });
  }

  showLogin() {
    this.loginScreen.classList.add("active");
    this.chatScreen.classList.remove("active");
    this.loginError.textContent = "";
    this.pseudoInput.focus();
  }

  showChat() {
    this.loginScreen.classList.remove("active");
    this.chatScreen.classList.add("active");
    this.currentUserSpan.textContent = this.currentUser;
    this.messageInput.disabled = false;
    this.messageInput.focus();

    // Clear previous messages and users
    this.messagesContainer.innerHTML = "";
    this.usersList.innerHTML = "";
    this.userCount.textContent = "0";
  }

  showError(message) {
    this.loginError.textContent = message;
    setTimeout(() => {
      this.loginError.textContent = "";
    }, 5000);
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  getMessageTypeLabel(type) {
    const labels = {
      normal: "💬 Normal",
      important: "⚠️ Important",
      urgent: "🚨 Urgent",
    };
    return labels[type] || "💬 Normal";
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Initialize the chat app when page loads
document.addEventListener("DOMContentLoaded", () => {
  new ChatApp();
});
