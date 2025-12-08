# Chat Room Application

A real-time web-hosted chat room built with Node.js, Express, and Socket.io.

## Features

- 🚀 Real-time messaging using WebSockets
- 👥 Active users list
- ✍️ Typing indicator
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design
- 💬 User join/leave notifications
- 🔐 Simple username-based authentication

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:

```bash
cd c:\Users\Talon\OneDrive\Desktop\network_&_Data\Project\main
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

(Requires `nodemon` to be installed)

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── server.js              # Express server and Socket.io setup
├── package.json           # Project dependencies
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # Styling
│   └── client.js         # Client-side JavaScript
```

## How to Use

1. Open `http://localhost:3000` in your browser
2. Enter your username and click "Join Chat"
3. Start chatting with other users in real-time
4. Click "Leave Chat" to disconnect

## Technologies Used

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Communication**: WebSockets

## Features Explained

- **Real-time Messages**: Messages are instantly delivered to all connected users
- **User List**: See who's currently in the chat room
- **Typing Indicator**: See when other users are typing
- **System Notifications**: Get notified when users join or leave
- **Timestamps**: Each message displays when it was sent

## Future Enhancements

- Private messaging between users
- Message history/persistence
- User profiles and avatars
- Emoji support
- File sharing
- Multiple chat rooms
- User authentication

## License

ISC
