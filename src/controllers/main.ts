import { Request, Response } from "express";
import { getUserHighScore } from "../services/rankingServices.js";

const mainController = {

    async index(req: Request, res: Response) {
        const userName = (req.session as any).userName;
        const userId   = (req.session as any).userId;
        const highScore = await getUserHighScore(userId);
        res.render("home", { userName, userId, highScore, layout: "main2" });
    },

    about(req: Request, res: Response) {

        res.render("about");
        
    }

};

export default mainController;