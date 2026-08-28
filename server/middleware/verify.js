const jwt = require("jsonwebtoken");

function protect(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token"
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
      

        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
}

module.exports = { protect };