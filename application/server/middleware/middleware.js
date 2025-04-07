import jwt from "jsonwebtoken";



const protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    token = token.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // Lưu thông tin user vào request
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, invalid token" });
    }
};

export default protect;