import { Router } from "express";

import mainController from "../controllers/main.js";
import majorController from "../controllers/majorController.js";
import userController from "../controllers/userController.js";
import validate from "../middlewares/validate.js";
import { majorSchema } from "../utils/validateMajor.js";
import { registerSchema } from "../utils/validateUser.js";

const router = Router();

// Rotas existentes
router.get("/", mainController.index);

router.get("/about", mainController.about);

// CRUD de Major
router.get("/major", majorController.index);
router.all("/major/create", validate(majorSchema), majorController.create);
router.get("/major/read/:id", majorController.read);
router.all("/major/update/:id", validate(majorSchema), majorController.update);
router.post("/major/remove/:id", majorController.remove);

// Cadastro de usuário
router.all("/user/register", validate(registerSchema), userController.register);

export default router;