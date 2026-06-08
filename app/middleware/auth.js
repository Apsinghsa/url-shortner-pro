import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default auth;
