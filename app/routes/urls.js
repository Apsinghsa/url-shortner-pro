import express from "express";
import { shortenUrl } from "../controllers/urlController";
import auth from "../middleware/auth";
const urlRouter = express.Router();

urlRouter.use(auth);
urlRouter.post("/shorten", shortenUrl);

export default urlRouter;
