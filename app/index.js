import express from "express";
import cors from "cors";
const app = express();
import urlRouter from "./routes/urls.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import linkRouter from "./routes/links.js";
import connectDB from "./config/db.js";
import { config } from "dotenv";
config();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://url-shortner-pro.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running.....");
});

app.use("/api/auth", authRouter);
app.use("/api/links", linkRouter);
app.use("/api", urlRouter);
app.use("/", indexRouter);

// server.js (Put this at the very bottom, after your routes)

app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);

  // Send a clean error message to the client instead of crashing the process
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);
});
