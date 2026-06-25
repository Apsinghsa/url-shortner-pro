import express from "express";
import { redirectToUrl } from "../controllers/urlController.js";

const router = express.Router();

router.get("/:code", redirectToUrl);

export default router;
