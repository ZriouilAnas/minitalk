const io = require("socket.io-client");

console.log("🔍 Testing WebSocket connection...");

// Create socket connection with better error handling
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  timeout: 5000,
});

// Event listeners with detailed logging
socket.on("connect", () => {
  console.log(" Connected to server!");
  console.log(" Socket ID:", socket.id);

  // Test authentication
  console.log(" Testing authentication...");
  socket.emit("auth:set-pseudo", { pseudo: "TestUser" });
});

socket.on("auth:require-pseudo", () => {
  console.log(" Server requires pseudo");
});

socket.on("auth:success", (data) => {
  console.log(" Authentication successful:", data);

  // Test sending a message after auth
  setTimeout(() => {
    console.log("💬 Testing message sending...");
    socket.emit(
      "message:send",
      {
        content: "Hello from test client!",
        type: "normal",
      },
      (ack) => {
        console.log("📩 Message acknowledgement:", ack);
      }
    );
  }, 1000);
});

socket.on("auth:error", (error) => {
  console.log("❌ Auth error:", error);
});

socket.on("message:new", (message) => {
  console.log("📨 Received message:", message);
});

socket.on("users:update", (users) => {
  console.log("👥 Users update:", users.length, "users online");
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.log("❌ Connection error:", error.message);
});

socket.on("error", (error) => {
  console.log("❌ Socket error:", error);
});

// Test after 3 seconds
setTimeout(() => {
  console.log("\n Running comprehensive tests...");

  // Test different message types
  const testMessages = [
    { content: "Normal message", type: "normal" },
    { content: "Important news!", type: "important" },
    { content: "URGENT: Attention!", type: "urgent" },
  ];

  testMessages.forEach((msg, index) => {
    setTimeout(() => {
      console.log(`📤 Sending ${msg.type} message...`);
      socket.emit("message:send", msg, (ack) => {
        console.log(`   ${msg.type} message ack:`, ack.status);
      });
    }, index * 1000);
  });
}, 3000);

// Cleanup after 10 seconds
setTimeout(() => {
  console.log("\n Cleaning up...");
  socket.disconnect();
  process.exit(0);
}, 10000);
