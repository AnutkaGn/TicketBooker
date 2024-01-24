const jwt = require("jsonwebtoken");

module.exports = function () {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }
        try {
            const role = "ADMIN"
            if (req.user.role !== role) {
                return res.status(403).json({message: "No access"});
            }
            next()
        } catch (error) {
            res.status(401).json({message: "Unauthorized"});
        }
    }
};