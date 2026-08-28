const express = require("express");

const { register, login, logout, get } = require("../controllers/user");
const { protect } = require("../middleware/verify");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/get", protect, get);

module.exports = { auth: router };