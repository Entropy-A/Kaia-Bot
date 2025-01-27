import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Locale,
} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {EmbedGenerator, handleError} from "../../utils/index.js";

const color = Colors.gray
const icon = Images.skipIcon
const detailedDescription = text.commands.statistics.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "stats",
    description: text.commands.statistics.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.statistics.description.locals, "en-US"),
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {

    } catch (error) {
        await handleError(interaction, error, logger)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})