import {LocaleString} from "discord.js";
import {text} from "../../text/loadText.js";

export enum ExpectedErrorID {
    userNotConnectedToVoice = "userNotConnectedToVoice",
    notConnectedToSameVC    = "notConnectedToSameVC",
    alreadyPaused           = "alreadyPaused",
    alreadyResumed          = "alreadyResumed",
    couldNotSkip            = "couldNotSkip",
    botNotConnected         = "botNotConnected",
}

export class ExpectedError extends Error {
    public readonly title?: string;
    public readonly message: string;
    public readonly cause?: string;

    constructor(id: ExpectedErrorID, locale: LocaleString) {
        super();
        Object.setPrototypeOf(this, ExpectedError.prototype) // ? Because docs say so ?
        this.title = text.error[id].title?.get(locale);
        this.message = text.error[id].message.get(locale)
        this.cause = text.error[id].cause?.get(locale)
    }
}

// TODO: Continue
export function handleError(error: unknown , logger: Logger): {name: string | null, message: string, cause: unknown} | undefined {

    if (error instanceof CustomError) {
        error.log(logger)

        const name = error.name
        const message = error.message
        const cause = error.cause

        return {name, message, cause}
    }

    if (error instanceof ExpectedError) {
        return {name: null, message: error.message, cause: null}
    }

    else {
        logger.error(error)

        return undefined

        return {
            name: "Unexpected Error",
            message: "An error occured in an unkown location. Please send a **ticket** with further context to assist fixing the problem.\n**Thank you :)**",
            cause: undefined
        }
    }
}