import express from "express";
import cors from "cors";
const app = express();
import urlRouter from "./routes/urls.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import linkRouter from "./routes/links.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorMiddleware.js";
import { config } from "dotenv";
config();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);
});
