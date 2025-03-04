import {ExpectedError} from "./types.js";
import {DynamicLogger, StaticLogger} from "../log/logger.js";
import {BaseInteraction, Embed} from "discord.js";
import {EmbedGenerator} from "../generators/index.js";
import {Colors} from "../../config/index.js"
import {Page, PageMenu} from "../../types/index.js";

export async function handleError(interaction: BaseInteraction, logger: StaticLogger, error: unknown, origin?: Page | PageMenu): Promise<void> {
    if (!(error instanceof ExpectedError)) logger.error(error);
    if(!(error instanceof ExpectedError || error instanceof Error)) return
    const page = new Page({
        id: "error",
        color: Colors.error,
        components: undefined, //TODO: send report.
        embeds: [EmbedGenerator.error(error, interaction.locale)]
    })

    await page.send(interaction, undefined, true)
}