import express from "express";
const app = express();
import urlRouter from "./routes/urls";
import indexRouter from "./routes/index";
import authRouter from "./routes/auth";
import connectDB from "./config/db";
import { config } from "dotenv";
config();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running.....");
});

app.use("/api/auth", authRouter);
app.use("/api", urlRouter);
app.use("/", indexRouter);
app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);
});
