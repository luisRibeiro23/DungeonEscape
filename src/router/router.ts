import { Router } from "express";

import mainController from "../controllers/main.js";
import majorController from "../controllers/majorController.js";
import validate from "../middlewares/validate.js";
import { majorSchema } from "../utils/validateMajor.js";

const router = Router();

// Rotas existentes
router.get("/", mainController.index);

router.get("/about", mainController.about);

// CRUD de Major
router.get("/major", majorController.index);
router.all("/major/create", validate(majorSchema), majorController.create);
router.get("/major/read/:id", majorController.read);
router.all("/major/update/:id", validate(majorSchema), majorController.update);
router.delete("/major/remove/:id", majorController.remove);

export default router;