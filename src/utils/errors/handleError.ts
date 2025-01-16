import {ExpectedError} from "./types.js";
import {DynamicLogger, StaticLogger} from "../log/logger.js";
import {BaseInteraction, Embed} from "discord.js";
import {EmbedGenerator} from "../generators/index.js";

export function handleError(interaction: BaseInteraction, error: unknown, logger: StaticLogger): void {
    if (!(error instanceof ExpectedError)) logger.error(error);
    if(!(error instanceof ExpectedError || error instanceof Error)) return
    const page = EmbedGenerator.error(error, interaction.locale)
}
// TODO: error handling with embeds and shit