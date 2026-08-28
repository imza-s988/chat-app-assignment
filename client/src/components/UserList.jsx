import { useState } from "react";
const initial = (name) => (name || "?").charAt(0).toUpperCase();
const messageTime = (date) => {
  if (!date) return "";
 const d = new Date(date);
  const today = new Date();
const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
if (sameDay) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
if (isYesterday) return "Yesterday";

  return d.toLocaleDateString();
};
const avatarColors = ["red", "blue", "purple", "pink", "orange", "teal"];
export default function UserList({
  me,
  users,
  activeUser,
  unread,
  onlineCount,
  onlineUsers,
  typingByUser,
  onSelect,
  onLogout,
}) {
  const [search, setSearch] = useState("");
const shown = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );
return (
    <div className="side">
      <div className="side-head">
        <div className="me">
          <div className="avatar">{initial(me?.name)}</div>
<div>
            <div className="name">{me?.name || "User"}</div>
            <div className="muted small">Logged in</div>
          </div>
        </div>

        <div className="right">
          <span className="online-pill">● Online: {onlineCount}</span>
<button className="link-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="search">
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="list">
      {shown.map((u) => {
        const isOnline = onlineUsers?.includes(String(u._id));

        const isTyping = Boolean(
          typingByUser?.[String(u._id)]
        );

          return (
            <div
              key={u._id}
              className={
                "row " +
                (activeUser?._id === u._id ? "active" : "")
              }
              onClick={() => onSelect(u)}
            >
              <div className={`avatar ${avatarColors[users.indexOf(u) % avatarColors.length]}`}>
                {initial(u.name)}

                <span
                  className={isOnline ? "dot online" : "dot offline"}
                ></span>
              </div>

              <div className="info">
                <div className="name">
                  {u.name}
                </div>

                <div className="muted small last-message">
                  {isTyping
                    ? "typing..."
                    : (u.lastMessage || "No messages yet")}
                </div>
              </div>

              <div className="message-info">
                <span className="muted small">
                  {messageTime(u.lastMessageTime)}
                </span>

                {unread?.[u._id] > 0 && (
                  <span className="badge">{unread[u._id]}</span>
                )}
              </div>
            </div>
          );
        })}

        {shown.length === 0 && (
          <p className="muted pad">No users found.</p>
        )}
      </div>
    </div>
  );
}