import { Router } from "express";
import auth from "../middleware/auth";
import { getMyLinks } from "../controllers/linksController";

const router = Router();
router.use(auth);
router.get("/my-links", getMyLinks);

export default router;
