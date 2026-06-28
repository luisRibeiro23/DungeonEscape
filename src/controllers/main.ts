import { Request, Response } from "express";

const mainController = {

    index(req: Request, res: Response) {

        res.render("home");

    },

    about(req: Request, res: Response) {

        res.render("about");

    }

};

export default mainController;