import dotenv from "dotenv";
import { cleanEnv, port, str } from "envalid";

dotenv.config();

function validateEnv() {
    return cleanEnv(process.env, {
        PORT: port({
            default: 4567
        }),

        NODE_ENV: str({
            default: "development",
            choices: ["development", "production"]
        })
    });
}

export default validateEnv;