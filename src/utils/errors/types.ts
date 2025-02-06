import {LocaleText, text} from "../../text/loadText.js";

export enum ExpectedErrorID {
    userNotConnectedToVoice = "userNotConnectedToVoice",
    notConnectedToSameVC    = "notConnectedToSameVC",
    alreadyPaused           = "alreadyPaused",
    alreadyResumed          = "alreadyResumed",
    couldNotSkip            = "couldNotSkip",
    botNotConnected         = "botNotConnected",
}

export class ExpectedError {
    public readonly title?: LocaleText;
    public readonly message: LocaleText;
    public readonly cause?: LocaleText;

    constructor(id: ExpectedErrorID) {
        this.title = text.error[id].title;
        this.message = text.error[id].message
        this.cause = text.error[id].cause
    }
}