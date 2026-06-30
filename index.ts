import express from "express";
import { engine } from "express-handlebars";

import validateEnv from "./src/utils/validateEnv.js";
import logger from "./src/middlewares/logger.js";
import router from "./src/router/router.js";
import helpers from "./src/views/helpers/helpers.js";

const env = validateEnv();

const app = express();

app.engine("handlebars", engine({ helpers }));

app.set("view engine", "handlebars");

app.set("views", `${process.cwd()}/src/views`);

app.use(logger("complete"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/css", express.static(`${process.cwd()}/public/css`));
app.use("/js", express.static(`${process.cwd()}/public/js`));
app.use("/img", express.static(`${process.cwd()}/public/img`));

app.use(router);

app.listen(env.PORT, () => {
    console.log(`Servidor iniciado na porta ${env.PORT}`);
});