import { useState, useEffect, useRef } from "react";
import socket from "../socket";

const time = (d) =>
  new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const initial = (name) =>
  (name || "?").charAt(0).toUpperCase();

export default function ChatThread({
  me,
  other,
  messages,
  onSend,
  isTyping,
  isOnline,
}) {
  const [text, setText] = useState("");
  const bottom = useRef(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;

    onSend(text.trim());
    setText("");

    if (other?._id) {
      socket.emit("chat:typing", {
        to: other._id,
        isTyping: false,
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (other?._id) {
      socket.emit("chat:typing", {
        to: other._id,
        isTyping: Boolean(value.trim()),
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="main">
      <div className="main-head">

        <div className="avatar grey">
          {initial(other?.name)}

          <span
            className={
              isOnline
                ? "status-dot online"
                : "status-dot offline"
            }
          />
        </div>

        <div>
          <div className="name">
            {other?.name || "User"}
          </div>

          <div
            className={
              isOnline
                ? "small green"
                : "small muted"
            }
          >
            {isOnline ? "online" : "offline"}
          </div>
        </div>

      </div>

      {/* BODY */}
      <div className="body">

        {messages.length === 0 && (
          <p className="muted center-text">
            No messages yet.
          </p>
        )}

        {messages.map((m) => {

          const senderId =
            typeof m.sender === "object"
              ? m.sender?._id
              : m.sender;

          const fromId = m.from || senderId;

          const myId =
            me?._id ||
            me?.id ||
            me?.userId;

          const isMine =
            String(fromId) === String(myId);

          return (
            <div
              key={m._id}
              className={
                "bubble " +
                (isMine ? "out" : "in")
              }
            >
              <span className="message-text">
                {m.text}
              </span>

              <span className="stamp">
                {time(m.createdAt)}

                {isMine && (
                  <span className={`ticks ${m.isRead ? "read" : ""}`}>
                    ✓✓
                  </span>
                )}
              </span>
            </div>
          );
        })}
<div ref={bottom} />
      </div>
      <div className="foot">
<input
          type="text"
          value={text}
          placeholder="Type a message"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className="send"
          onClick={send}
          disabled={!text.trim()}
        >
          ➤
        </button>

      </div>

    </div>
  );
}