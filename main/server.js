const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Store active users
const users = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins
  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("user-joined", {
      username: username,
      message: `${username} joined the chat`,
    });
    io.emit("user-list", Object.values(users));
    console.log(`${username} joined the chat`);
  });

  // Handle messages
  socket.on("send-message", (data) => {
    const username = users[socket.id];
    io.emit("receive-message", {
      username: username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
    });
    console.log(`${username}: ${data.message}`);
  });

  //profanity filter
  //socket.on

  // User typing indicator
  socket.on("typing", (data) => {
    socket.broadcast.emit("user-typing", {
      username: data.username,
    });
  });

  // Stop typing
  socket.on("stop-typing", () => {
    socket.broadcast.emit("user-stop-typing", {
      username: users[socket.id],
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit("user-left", {
        username: username,
        message: `${username} left the chat`,
      });
      io.emit("user-list", Object.values(users));
      console.log(`${username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Chat server is running on port ${PORT}`);
});
