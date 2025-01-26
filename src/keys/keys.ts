import {getEnvVariable} from "../utils/index.js";

export const Keys = {
    token: getEnvVariable("TOKEN"),
    id: getEnvVariable("ID"),
    mongoUrl: getEnvVariable("MONGOURL"),
} as const;