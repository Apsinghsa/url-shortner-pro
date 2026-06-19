import { Router } from "express";
import auth from "../middleware/auth.js";
import { getMyLinks } from "../controllers/linksController.js";

const router = Router();
router.use(auth);
router.get("/my-links", getMyLinks);

export default router;
