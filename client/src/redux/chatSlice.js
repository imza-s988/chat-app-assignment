import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    users: [], activeUser: null, messages: [], isConnected: false, onlineUserCount: 0, onlineUsers: [], unread: {},
    typingByUser: {},
    error: null,
};

const chatSlice = createSlice({
    name: "chat",

    initialState,
    // Added reducers to detect changes after actions.........
    reducers: {
        usersLoaded: (state, action) => {
            state.users = action.payload;
        },

        chatOpened: (state, action) => {
            state.activeUser = action.payload;
            state.messages = [];
        },

        chatClosed: (state) => {
            state.activeUser = null;
            state.messages = [];
        },

        historyLoaded: (state, action) => {
            state.messages = action.payload;
        },

        messageReceived: {
            prepare: (message, me) => ({
                payload: { message, me },
            }),

            reducer: (state, action) => {
                const { message, me } = action.payload;

                const senderId = String(message.sender?._id);
                const recipientId = String(message.recipient);

                const otherUserId =
                    senderId === String(me)
                        ? recipientId
                        : senderId;

                if (
                    otherUserId !== String(state.activeUser?._id)
                ) {
                    return;
                }

                if (
                    state.messages.some(
                        (item) => item._id === message._id
                    )
                ) {
                    return;
                }

                state.messages.push(message);
            },
        },

        connectionChanged: (state, action) => {
            state.isConnected = action.payload;
        },

        onlineCountChanged: (state, action) => {
            state.onlineUserCount = action.payload;
        },

        onlineUsersChanged: (state, action) => {
            state.onlineUsers = action.payload;
        },

        unreadUpdated: (state, action) => {
            const { userId, count } = action.payload;

            state.unread[userId] = count;
        },

        typingChanged: (state, action) => {
            const { from, isTyping } = action.payload;

            if (from) {
                state.typingByUser[from] = isTyping;
            }
        },

        chatError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    usersLoaded,
    chatOpened,
    chatClosed,
    historyLoaded,
    messageReceived,
    connectionChanged,
    onlineCountChanged,
    onlineUsersChanged,
    unreadUpdated,
    typingChanged,
    chatError,
} = chatSlice.actions;

export default chatSlice.reducer;