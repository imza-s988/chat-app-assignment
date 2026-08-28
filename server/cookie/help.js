const jwt = require("jsonwebtoken");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
const signToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
const publicUser = (u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
});
module.exports = {
    cookieOptions,
    signToken,
    publicUser,
};



