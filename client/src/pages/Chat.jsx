import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../api";
import socket from "../socket";
import UserList from "../components/UserList.jsx";
import ChatThread from "../components/ChatThread.jsx";
import {
  usersLoaded,
  chatOpened,
  historyLoaded,
  messageReceived,
  connectionChanged,
  onlineCountChanged,
  onlineUsersChanged,
  unreadUpdated,
  chatError,
  typingChanged,
} from "../redux/chatSlice";

export default function Chat({ user, onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
// Get logged-in user from Redux
const reduxUser = useSelector((state) => state.auth.user);
const me = user?.user || reduxUser?.user || reduxUser;
  // Get chat data from Redux
  const {
    users,activeUser,messages,isConnected,onlineUserCount,onlineUsers,unread,typingByUser,error,
  } = useSelector((state) => state.chat);
  // LOAD USERS
useEffect(() => {
    api.get("/chat/users")
      .then((res) => {
        dispatch(usersLoaded(res.data.users));
      })
      .catch((err) => {
        dispatch(chatError(err.response?.data?.msg ||err.response?.data?.message ||
            "Failed to load users"
          )
        );
      });
  }, [dispatch]);
// SOCKET CONNECTION + LISTENERS
useEffect(() => {
    socket.on("connect", () => {
      dispatch(connectionChanged(true));
    });
socket.on("disconnect", () => {
      dispatch(connectionChanged(false));
    });
socket.on("connect_error", (err) => {
      dispatch(chatError(err.message));
    });
// Online users count
socket.on("online:count", (count) => {
      dispatch(onlineCountChanged(count));
    });
socket.on("online:users", (users) => {
      dispatch(onlineUsersChanged(users));
    });
// New message
    socket.on("chat:message", (message) => {
      const myId = String(me?._id || me?.id);
     const senderId = String(
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender
      );
const recipientId = String(message.recipient);
dispatch(messageReceived(message, myId));
// THIS MEAN WHEM MESSAGE OPEN FROM CURRENT CHAT

      if (
        recipientId === myId &&
        senderId === String(activeUser?._id)
      ) {
        socket.emit("chat:read", senderId, (result) => {
          if (result?.error) {
            dispatch(chatError(result.error));
            return;
          }dispatch(
            unreadUpdated({
              userId: senderId,
              count: 0,
            })
          );
        });
      }
    });
    // Typing
    socket.on("chat:typing", (event) => {
      dispatch(typingChanged(event));
    });

    // Unread count update
    socket.on("chat:unread:update", ({ userId, count }) => {
      dispatch(
        unreadUpdated({
          userId,
          count,
        })
      );
    });

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Get existing unread messages
    socket.emit("chat:unread", (result) => {
      if (result?.error) {
        dispatch(chatError(result.error));
        return;
      }

      if (result?.unread) {
        result.unread.forEach(({ userId, count }) => {
          dispatch(
            unreadUpdated({
              userId,
              count,
            })
          );
        });
      }
    });

    // Remove listeners
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("online:count");
      socket.off("online:users");
      socket.off("chat:message");
      socket.off("chat:typing");
      socket.off("chat:unread:update");
    };
  }, [dispatch, me?._id, me?.id, activeUser?._id]);
  console.log("CHAT USER PROP:", user);
  console.log("REDUX USER:", reduxUser);
  console.log("FINAL ME:", me);
// open chat
  const openChat = (other) => {
    // Store selected user in Redux
    dispatch(chatOpened(other));
// Load old messages
    socket.emit("chat:history", other._id, (result) => {
      if (result?.error) {
        dispatch(chatError(result.error));
        return;
      }

      dispatch(historyLoaded(result.messages || []));
    });

    // Mark messages from this user as read
    socket.emit("chat:read", other._id, (result) => {
      if (result?.error) {
        dispatch(chatError(result.error));
        return;
      }
    });// Remove unread badge immediately
    dispatch(
      unreadUpdated({
        userId: other._id,
        count: 0,
      })
    );
  };
// send Message
  const sendMessage = (text) => {
    if (!text?.trim() || !activeUser) {
      return;
    }
socket.emit("chat:send", {
      to: activeUser._id,
      text: text.trim(),
    });
  };
// logout
const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
socket.disconnect();
onLogout();
navigate("/login");
  };
  const isActiveOnline =
    onlineUsers.includes(String(activeUser?._id));
return (
    <div className="app">
      <UserList
        me={me}
        users={users}
        activeUser={activeUser}
        unread={unread}
        onlineCount={onlineUserCount}
        onlineUsers={onlineUsers}
        typingByUser={typingByUser}
        onSelect={openChat}
        onLogout={logout}
      />

      {activeUser ? (
        <ChatThread
          me={me}
          other={activeUser}
          messages={messages}
          onSend={sendMessage}
          isTyping={Boolean(typingByUser[activeUser._id])}
          isOnline={isActiveOnline}
        />
      ) : (
        <div className="main">
          <div className="empty">
            <div className="empty-icon">💬</div>
          <h3>WhatsApp Style Chat</h3>
          <p>Select a user from the left to start chatting.</p>
         <span className="online-pill">
              {isConnected ? "Online" : "Offline"} · Online Users:{" "}
              {onlineUserCount}
            </span>
{error && (<p className="error">{error}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}