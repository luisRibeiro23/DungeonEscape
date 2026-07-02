import { Request, Response } from "express";

const mainController = {

    index(req: Request, res: Response) {
        const userName = (req.session as any).userName;
        res.render("home", { userName, layout: "main2" });
    },

    about(req: Request, res: Response) {

        res.render("about");
        
    }

};

export default mainController;