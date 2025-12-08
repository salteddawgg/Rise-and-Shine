const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const Filter = require("bad-words");
const { TIMEOUT } = require("dns");
const filter = new Filter();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files (serve it queen)
app.use(express.static(path.join(__dirname, "public")));

// Store active users
const users = {};
const userTimestamps = {};
setInterval(() => {
  const now = Date.now();
  const TIMEOUT_MS = 600000; //10 min timeout

  for (const socketID in userTimestamps) {
    if (now - userTimestamps[socketID] > TIMEOUT_MS) {
      console.log(`kicking user ${users[socketID]} for inactivity`);
      delete users[socketID];
      delete userTimestamps[socketID];
    }
  }
}, 300000); //runs check around every 5 min

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins
  socket.on("join", (username) => {
    const usernameTaken = Object.values(users).includes(username);
    if (usernameTaken) {
      socket.emit("join-error", {
        message: `Username "${username}" is already taken. Please choose a different one.`,
      });
      console.log(`${username} attempted to join but username was taken`);
      return;
    }

    users[socket.id] = username;
    userTimestamps[socket.id] = Date.now(); // Record join time
    socket.emit("join-success", {
      message: "You have successfully joined the chat",
    });
    socket.broadcast.emit("user-joined", {
      username: username,
      message: `${username} joined the chat`,
    });
    io.emit("user-list", Object.values(users));
    console.log(`${username} joined the chat`);
  });

  // Handle messages
  socket.on("send-message", (data) => {
    userTimestamps[socket.id] = Date.now(); // Update activity
    const cleanedMessage = filter.clean(data.message);
    const username = users[socket.id];
    io.emit("receive-message", {
      username: username,
      message: cleanedMessage,
      timestamp: new Date().toLocaleTimeString(),
    });
    console.log(`${username}: ${cleanedMessage}`);
  });

  // User typing indicator
  socket.on("typing", (data) => {
    userTimestamps[socket.id] = Date.now(); // Update activity
    socket.broadcast.emit("user-typing", {
      username: data.username,
    });
  });

  // Stop typing (animation stop is buggy, re-check)
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
      delete userTimestamps[socket.id]; // Clean up timestamp
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
