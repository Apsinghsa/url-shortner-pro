import express from "express";
import { redirectToUrl } from "../controllers/urlController";

const router = express.Router();

router.get("/somerandonroute", (req, res) => {
  res.status(200).send("some random long testing url");
});
router.get("/:code", redirectToUrl);

export default router;
