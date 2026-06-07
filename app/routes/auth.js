import express from "express";

const router = express.Router();

router.post("/register", (req, res) => {
  res.status(200).json({ success: true, message: "Register route reachable!" });
});
export default router;
