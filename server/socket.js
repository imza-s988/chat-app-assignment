const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const mongoose = require("mongoose");

const Message = require("./models/Message");
const User = require("./models/User");

const isId = (value) => mongoose.isValidObjectId(value);
const onlineUsers = new Map();

function getOnlineCount() {
    return onlineUsers.size;
}
function getOnlineUsers() {
    return Array.from(onlineUsers.keys());
}

function addUser(userId) {
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
}

function removeUser(userId) {
    const count = (onlineUsers.get(userId) || 1) - 1;

    if (count <= 0) {
        onlineUsers.delete(userId);
    } else {
        onlineUsers.set(userId, count);
    }
}

async function sendHistory(socket, withUserId, ack) {
    try {
        if (!isId(withUserId)) {
            return ack?.({ error: "Bad user id" });
        }

        if (!(await User.exists({ _id: withUserId }))) {
            return ack?.({ error: "User not found" });
        }

        const messages = await Message.between(
            socket.user.id,
            withUserId
        )
            .populate("sender", "name")
            .lean();

        ack?.({ ok: true, messages });
    } catch (err) {
        ack?.({ error: err.message });
    }
}

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin:
                process.env.CLIENT_URL ||
                "http://localhost:5173",
            credentials: true
        }
    });
// jwt authentication
    io.use((socket, next) => {
        try {
            const raw = socket.handshake.headers.cookie || "";
            const token = cookie.parse(raw).token;

            if (!token) {
                return next(new Error("No token"));
            }

            const payload = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = { id: payload.id };
            next();
        } catch {
            next(new Error("Not authorised"));
        }
    });

    io.on("connection", (socket) => {
        const userId = String(socket.user.id);

        socket.join(userId);
        addUser(userId);

        // online count
        io.emit("online:count", getOnlineCount());
        io.emit("online:users", getOnlineUsers());


        // old messages history
        socket.on("chat:history", (withUserId, ack) => {
            sendHistory(socket, withUserId, ack);
        });

        // send message
        socket.on("chat:send", async ({ to, text } = {}, ack) => {
            try {
                if (!isId(to)) {
                    return ack?.({ error: "Bad recipient" });
                }

                if (!(await User.exists({ _id: to }))) {
                    return ack?.({ error: "Recipient not found" });
                }

                text = String(text ?? "").trim();

                if (!text) {
                    return ack?.({ error: "Text required" });
                }

                if (text.length > 2000) {
                    return ack?.({ error: "Message too long" });
                }

                const message = await Message.create({
                    text,
                    sender: userId,
                    recipient: to,
                    isRead: false
                });

                await message.populate("sender", "name");

                // send to sender and receiver
                io.to(userId)
                    .to(String(to))
                    .emit("chat:message", message);

                // unread count for receiver
                const count = await Message.countDocuments({
                    sender: userId,
                    recipient: to,
                    isRead: false
                });

                io.to(String(to)).emit(
                    "chat:unread:update",
                    {
                        userId,
                        count
                    }
                );

                ack?.({ ok: true });

            } catch (err) {
                console.error("chat:send error:", err);
                ack?.({ error: err.message });
            }
        });

        // unread messages
        socket.on("chat:unread", async (ack) => {
            try {
                const messages = await Message.find({
                    recipient: userId,
                    isRead: false
                }).select("sender");

                const counts = {};

                for (const message of messages) {
                    const senderId = String(message.sender);
                    counts[senderId] =
                        (counts[senderId] || 0) + 1;
                }

                const unread = Object.entries(counts).map(
                    ([userId, count]) => ({
                        userId,
                        count
                    })
                );

                ack?.({ ok: true, unread });

            } catch (err) {
                ack?.({ error: err.message });
            }
        });

        // mark messages as read
        socket.on("chat:read", async (fromUserId, ack) => {
            try {
                if (!isId(fromUserId)) {
                    return ack?.({ error: "Bad user id" });
                }

                await Message.updateMany(
                    {
                        sender: fromUserId,
                        recipient: userId,
                        isRead: false
                    },
                    {
                        $set: { isRead: true }
                    }
                );

                io.to(userId).emit(
                    "chat:unread:update",
                    {
                        userId: fromUserId,
                        count: 0
                    }
                );

                ack?.({ ok: true });

            } catch (err) {
                ack?.({ error: err.message });
            }
        });

        // typing  bonus
        socket.on("chat:typing", ({ to, isTyping } = {}) => {
            if (!isId(to)) return;

            io.to(to).emit("chat:typing", {
                from: userId,
                isTyping: Boolean(isTyping)
            });
        });

        // disconnect
        socket.on("disconnect", () => {
            removeUser(userId);
            io.emit("online:count", getOnlineCount());
          
            io.emit("online:users", getOnlineUsers());
        });
    });

    return io;
}

module.exports = {initSocket};