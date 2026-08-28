const express = require("express");

const { listChatUsers } = require("../controllers/chat");
const { protect } = require("../middleware/verify");

const router = express.Router();

router.get("/users", protect, listChatUsers);

module.exports = router;
