import { Router } from "express";

import mainController from "../controllers/main.js";
import majorController from "../controllers/majorController.js";
import userController from "../controllers/userController.js";
import gameSessionController from "../controllers/gameSessionController.js";
import rankingController from "../controllers/rankingController.js";
import validate from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { majorSchema } from "../utils/validateMajor.js";
import { registerSchema, loginSchema } from "../utils/validateUser.js";

const router = Router();

// Página principal — jogo (apenas logados)
router.get("/", requireAuth, mainController.index);

router.get("/about", mainController.about);

// CRUD de Major
router.get("/major", majorController.index);
router.all("/major/create", validate(majorSchema), majorController.create);
router.get("/major/read/:id", majorController.read);
router.all("/major/update/:id", validate(majorSchema), majorController.update);
router.post("/major/remove/:id", majorController.remove);

// Usuário
router.all("/user/register", validate(registerSchema), userController.register);
router.all("/user/login", validate(loginSchema), userController.login);
router.post("/user/logout", userController.logout);

// Ranking
router.get("/ranking", requireAuth, rankingController.index);

// Game session (Ajax)
router.post("/game-session", requireAuth, gameSessionController.save);

export default router;