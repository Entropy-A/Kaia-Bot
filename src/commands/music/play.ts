import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {ChatInputApplicationCommandData, ChatInputCommandInteraction, LocaleString} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {EmbedGenerator, handleError} from "../../utils/index.js";

const color = Colors.gray
const icon = Images.pingIcon
const detailedDescription = text.commands.play.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "play",
    description: text.commands.play.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.play.description.locals, "en-US"),
    options : [{
        name: "title",
        description: text.commands.play.optionDescription.get("en-US"),
        descriptionLocalizations: _.omit(text.commands.play.optionDescription.locals, "en-US"),
        type: 3,
        required: true,
    }],
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {

    } catch (error) {
        await handleError(interaction, error, logger)
    }
}

// ! Command export.
export const play = new Command({data, icon, color, detailedDescription, callback})
