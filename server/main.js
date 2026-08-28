require("dotenv").config();

const express = require("express");
const server = express();

const { connectDB } = require("./connection/db");
const { auth } = require("./route/auth");
const chat = require("./route/chat");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

const { initSocket } = require("./socket");

server.use(express.json());
server.use(cookieParser());

server.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

server.use("/api", auth);
server.use("/api/chat", chat);

const httpServer = http.createServer(server);

initSocket(httpServer);

connectDB()
    .then(() => {
        httpServer.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database startup failed:", error.message);
        process.exit(1);
    });