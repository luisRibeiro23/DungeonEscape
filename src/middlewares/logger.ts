import { Request, Response, NextFunction } from "express";

type LogType = "simple" | "complete";

function logger(type: LogType) {

    return (req: Request, res: Response, next: NextFunction) => {

        if (type === "simple") {

            console.log(`${req.method} ${req.url}`);

        } else {

            console.log("--------------------------------");

            console.log("Método :", req.method);

            console.log("URL :", req.url);

            console.log("Hora :", new Date());

            console.log("--------------------------------");

        }

        next();

    };

}

export default logger;