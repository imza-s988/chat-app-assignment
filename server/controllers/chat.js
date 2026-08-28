const User = require("../models/User");
const Message = require("../models/Message");

async function listChatUsers(req, res) {
    const users = await User.find({
        _id: { $ne: req.user.id }
    })
        .select("name email role")
        // .sort({ name: 1 })
        .lean();

    for (const user of users) {
        const message = await Message.findOne({
            $or: [
                { sender: req.user.id, recipient: user._id },
                { sender: user._id, recipient: req.user.id }
            ]
        })
            .sort({ createdAt: -1 })
            .select("text createdAt");

        user.lastMessage = message?.text || "";
        user.lastMessageTime = message?.createdAt || null;
    }
    users.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json({ success: true, users });
}

module.exports = { listChatUsers };