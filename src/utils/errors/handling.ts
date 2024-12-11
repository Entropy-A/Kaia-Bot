
import {ExpectedError} from "./types.js";
import {DynamicLogger, StaticLogger} from "../log/logger.js";
import {Embed} from "discord.js";

export function handleError(error: Error | ExpectedError , logger: DynamicLogger | StaticLogger): Embed {

    if (error instanceof ExpectedError) {
        return {
            title: error.title, message: error.message, cause: error.cause
        }
    } else {

        return undefined

        return {
            name: "Unexpected Error",
            message: "An error occured in an unkown location. Please send a **ticket** with further context to assist fixing the problem.\n**Thank you :)**",
            cause: undefined
        }
    }
}
// TODO: error handling with embeds and shit