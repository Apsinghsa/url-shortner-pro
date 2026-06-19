import express from "express";
import { shortenUrl } from "../controllers/urlController.js";
import auth from "../middleware/auth.js";
const urlRouter = express.Router();

urlRouter.use(auth);
urlRouter.post("/shorten", shortenUrl);

export default urlRouter;
