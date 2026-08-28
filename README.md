# Chat App Assignment

A WhatsApp-style real-time chat application built using the MERN stack and Socket.IO.

## Project Name

**Chat App Assignment**

## Student Name

**Imza Sarwar**

## Technologies Used

- React.js
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Redux Toolkit
- Axios
- JWT Authentication
- CSS

## Project Structure

```text
chat-app-assignment/
│
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── screenshots/
│   ├── 01-login.png
│   ├── 02-userlist.png
│   ├── 03-chat.png
│   ├── 04-unread.png
│   ├── 05-mobile.png
│   └── 06-two-users.png
│
├── .gitignore
├── .env.example
└── README.md
```

## Features

- User registration and login
- JWT-based authentication
- Protected user information
- Real-time messaging using Socket.IO
- Online and offline user status
- Online user count
- Typing indicator
- Unread message count
- Read messages
- Blue read ticks
- Message history
- Messages stored in MongoDB
- Messages remain available after page refresh
- User search
- Last message and message time
- Responsive mobile layout
- Logout functionality
- Two users can chat in real time

## How to Run

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd chat-app-assignment
```

### 2. Run the Backend

Open a terminal and move into the server folder:

```bash
cd server
```

Install the backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:3000
```

### 3. Run the Frontend

Open another terminal.

Move into the client folder:

```bash
cd client
```

Install the frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

### 4. Open the Application

Open the frontend URL in your browser:

```text
http://localhost:5173
```

## Environment Variables

The `.env` file contains private configuration and must not be pushed to GitHub.

Use `.env.example` as a template:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

The actual `.env` file is excluded using `.gitignore`.

## Socket Events

The application uses Socket.IO for real-time communication.

### Connection Events

```text
connect
disconnect
connect_error
```

### Online Status Events

```text
online:count
online:users
```

### Chat Events

```text
chat:send
chat:message
chat:history
```

### Read / Unread Events

```text
chat:unread
chat:unread:update
chat:read
```

### Typing Event

```text
chat:typing
```

## Socket Event Description

| Event | Purpose |
|---|---|
| `connect` | Detects when the socket connects |
| `disconnect` | Detects when the socket disconnects |
| `connect_error` | Handles socket connection errors |
| `online:count` | Sends the number of currently online users |
| `online:users` | Sends the IDs of currently online users |
| `chat:send` | Sends a new chat message |
| `chat:message` | Receives a new chat message in real time |
| `chat:history` | Loads previous messages between two users |
| `chat:unread` | Gets existing unread messages |
| `chat:unread:update` | Updates the unread message count |
| `chat:read` | Marks messages as read |
| `chat:typing` | Shows the typing indicator |

## Database

MongoDB is used to store chat messages and user information.

Messages are saved in MongoDB, so the chat history is not lost after refreshing the browser.

Each message contains information such as:

- Message text
- Sender
- Recipient
- Read/unread status
- Creation time

## Testing

The application was tested using two browser sessions:

1. Normal browser window
2. Incognito browser window

Two different users can log in at the same time and communicate through the chat application.

The following functionality was tested:

- Login
- Registration
- User list
- Online/offline status
- Real-time message sending
- Real-time message receiving
- Typing indicator
- Unread message count
- Read messages
- Blue read ticks
- Message history
- Refresh persistence
- Logout
- Mobile responsive layout

## Screenshots

### 01 - Login

![Login](screenshots/01-login.png)

### 02 - User List

![User List](screenshots/02-userlist.png)

### 03 - Chat

![Chat](screenshots/03-chat.png)

### 04 - Unread Messages

![Unread Messages](screenshots/04-unread.png)

### 05 - Mobile View

![Mobile View](screenshots/05-mobile.png)

### 06 - Two Users Chatting

![Two Users Chatting](screenshots/06-two-users.png)
## GitHub Repository

The complete project is available in the GitHub repository:

**YOUR_GITHUB_REPOSITORY_URL**

## Conclusion

This project demonstrates a real-time WhatsApp-style chat application using React, Node.js, Express, MongoDB, Redux Toolkit and Socket.IO.

It supports authentication, real-time communication, online/offline status, typing indicators, unread messages, read status, message history and persistent MongoDB storage.