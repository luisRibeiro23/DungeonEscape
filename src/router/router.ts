import { Router } from "express";

import mainController from "../controllers/main.js";

const router = Router();

router.get("/", mainController.index);

router.get("/about", mainController.about);

export default router;