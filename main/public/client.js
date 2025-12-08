// Initialize Socket.io connection
const socket = io();

// DOM Elements
const joinSection = document.getElementById("join-section");
const chatSection = document.getElementById("chat-section");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");
const leaveBtn = document.getElementById("leave-btn");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const messagesContainer = document.getElementById("messages-container");
const usersList = document.getElementById("users-list");
const currentUserSpan = document.getElementById("current-user");
const userCount = document.getElementById("user-count");
const typingIndicator = document.getElementById("typing-indicator");
const typingText = document.getElementById("typing-text");

let currentUsername = "";
let typingTimeout;

// Join Chat
joinBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a username");
    return;
  }

  if (username.length < 4) {
    alert("Username must be at least 2 characters");
    return;
  }

  //Im not going to sanitize every possibl word (turns out there are SO MANY), just a few for demo purposes
  if (username === "fuck" || username === "shit" || username === "bitch") {
    alert("Please choose a appropriate username");
    return;
  }

  currentUsername = username;
  socket.emit("join", username);

  // Switch to chat view
  joinSection.classList.add("hidden");
  chatSection.classList.remove("hidden");
  currentUserSpan.textContent = `You: ${username}`;
  messageInput.focus();
});

// Send Message
const sendMessage = () => {
  const message = messageInput.value.trim();

  if (message === "") {
    return;
  }
  //lenght
  if (message.length > 10) {
    alert(" Max character length reached");
    return;
  }
  socket.emit("send-message", { message: message });
  messageInput.value = "";
  socket.emit("stop-typing");
  clearTimeout(typingTimeout);
};

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  } else {
    // Emit typing event
    socket.emit("typing", { username: currentUsername });

    // Reset typing timeout
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing");
    }, 1000);
  }
});

messageInput.addEventListener("blur", () => {
  socket.emit("stop-typing");
});

// Leave Chat
leaveBtn.addEventListener("click", () => {
  socket.disconnect();
  location.reload();
});

// Socket Events
socket.on("receive-message", (data) => {
  displayMessage(data.username, data.message, data.timestamp, false);
});

socket.on("user-joined", (data) => {
  displaySystemMessage(data.message);
});

socket.on("user-left", (data) => {
  displaySystemMessage(data.message);
});

socket.on("user-list", (users) => {
  updateUsersList(users);
});

socket.on("user-typing", (data) => {
  showTypingIndicator(data.username);
});

socket.on("user-stop-typing", (data) => {
  hideTypingIndicator();
});

// Display message function
function displayMessage(username, message, timestamp, isOwn = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isOwn ? "own" : "other"}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  const usernameDiv = document.createElement("div");
  usernameDiv.className = "message-username";
  usernameDiv.textContent = username;

  const textDiv = document.createElement("div");
  textDiv.className = "message-text";
  textDiv.textContent = message;

  const timestampDiv = document.createElement("div");
  timestampDiv.className = "message-timestamp";
  timestampDiv.textContent = timestamp;

  contentDiv.appendChild(usernameDiv);
  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(timestampDiv);
  messageDiv.appendChild(contentDiv);

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Display system message
function displaySystemMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "system-message";
  messageDiv.innerHTML = `<p>${message}</p>`;
  if (messageDiv.textContent === "fuck" || "shit" || "bitch") {
  }

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Update users list
function updateUsersList(users) {
  usersList.innerHTML = "";
  userCount.textContent = users.length;

  if (users.length === 0) {
    usersList.innerHTML = '<p class="empty-state">No users yet</p>';
    return;
  }

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "user-item";
    userItem.textContent = user;
    usersList.appendChild(userItem);
  });
}

// Typing indicator
function showTypingIndicator(username) {
  typingText.textContent = `${username} is typing...`;
  typingIndicator.classList.remove("hidden");
}

function hideTypingIndicator() {
  typingIndicator.classList.add("hidden");
  typingText.textContent = "";
}

// Scroll to bottom
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Allow Enter key to submit username
usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    joinBtn.click();
  }
});

// Focus on username input when page loads
window.addEventListener("load", () => {
  usernameInput.focus();
});
