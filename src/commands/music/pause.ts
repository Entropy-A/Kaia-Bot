import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    GuildMember,
    Locale,
    LocaleString
} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {EmbedGenerator, handleError} from "../../utils/index.js";
import {CURRENTLYNOTAVAILABLE} from "./play.js";

const color = Colors.gray
const icon = Images.pauseIcon
const detailedDescription = text.commands.pause.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "pause",
    description: text.commands.pause.description.get(Locale.EnglishUS),
    descriptionLocalizations: _.omit(text.commands.pause.description.locals, "en-US"),
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        await CURRENTLYNOTAVAILABLE().send(interaction, undefined, true);

    } catch (error) {
        await handleError(interaction, logger, error)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})