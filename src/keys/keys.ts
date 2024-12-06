import {getEnvVariable} from "../utils/index.js";

export const Keys = {
    token: getEnvVariable("TOKEN"),
    id: getEnvVariable("ID"),
    testGuild: getEnvVariable("TEST_GUILD"),
} as const;