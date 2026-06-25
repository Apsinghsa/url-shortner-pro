import { Router } from "express";
import auth from "../middleware/auth.js";
import { getMyLinks, getClicksByDay } from "../controllers/linksController.js";

const router = Router();
router.use(auth);
router.get("/my-links", getMyLinks);
router.get("/clicks-by-day", getClicksByDay);

export default router;
