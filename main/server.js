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

// Babble mode state and vote tracking
let DEFAULT_IDLE_TIMEOUT_MS = 600000; // 10 minutes
let idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS;
let babbleActive = false;
let votes = new Set(); // socket ids that voted
let babbleTimer = null;

// Cleanup loop: runs frequently so short idle time (e.g., 8s) is enforced during babble
setInterval(() => {
  const now = Date.now();

  for (const socketID in userTimestamps) {
    if (now - userTimestamps[socketID] > idleTimeoutMs) {
      const username = users[socketID];
      console.log(`kicking user ${username} for inactivity`);
      delete users[socketID];
      delete userTimestamps[socketID];
      votes.delete(socketID);
      io.emit("user-left", {
        username: username,
        message: `${username} left the chat (idle)`,
      });
      io.emit("user-list", Object.values(users));
      io.emit("vote-update", {
        votes: votes.size,
        required: Math.floor(Object.values(users).length / 2) + 1,
      });
    }
  }
}, 5000); // check every 5s

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
      return; // stop further processing
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
    // send current vote state to newly joined client
    socket.emit("vote-update", {
      votes: votes.size,
      required: Math.floor(Object.values(users).length / 2) + 1,
    });
  });

  // Handle babble voting
  socket.on("vote-babble", () => {
    if (babbleActive) return; // ignore votes while active

    if (votes.has(socket.id)) {
      votes.delete(socket.id);
      socket.emit("vote-ack", { voted: false });
    } else {
      votes.add(socket.id);
      socket.emit("vote-ack", { voted: true });
    }

    const required = Math.floor(Object.values(users).length / 2) + 1;
    io.emit("vote-update", { votes: votes.size, required });

    if (votes.size >= required && !babbleActive) {
      // Activate babble mode
      babbleActive = true;
      idleTimeoutMs = 8000; // 8 seconds
      io.emit("system-message", { message: "Babble mode has been turned ON" });
      io.emit("babble-on", { duration: 80 });

      // Automatically end babble after 80s
      if (babbleTimer) clearTimeout(babbleTimer);
      babbleTimer = setTimeout(() => {
        // end babble
        babbleActive = false;
        idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS;
        votes.clear();
        io.emit("system-message", {
          message: "Babble mode has been turned OFF",
        });
        io.emit("babble-off");
        io.emit("vote-update", {
          votes: votes.size,
          required: Math.floor(Object.values(users).length / 2) + 1,
        });
      }, 80 * 1000);
    }
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
      votes.delete(socket.id);
      io.emit("user-left", {
        username: username,
        message: `${username} left the chat`,
      });
      io.emit("user-list", Object.values(users));
      io.emit("vote-update", {
        votes: votes.size,
        required: Math.floor(Object.values(users).length / 2) + 1,
      });
      console.log(`${username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Chat server is running on port ${PORT}`);
});
