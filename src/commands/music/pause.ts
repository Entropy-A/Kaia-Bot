import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {ChatInputApplicationCommandData, ChatInputCommandInteraction, GuildMember, LocaleString} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {EmbedGenerator, handleError} from "../../utils/index.js";

const color = Colors.gray
const icon = Images.pauseIcon
const detailedDescription = text.commands.pause.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "pause",
    description: text.commands.pause.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.pause.description.locals, "en-US"),
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        await CURRENTLYNOTAVAILABLE().send(interaction, undefined, true);

    } catch (error) {
        await handleError(interaction, error, logger)
    }
}

// ! Command export.
export const pause = new Command({data, icon, color, detailedDescription, callback})

function CURRENTLYNOTAVAILABLE() {
    return new Page({
        id: "musicNotAvailable",
        embeds: [EmbedGenerator.create({
            color: Colors.error,
            author: {iconURL: Images.errorIcon, name: "Music commands currently unavailable."},
            description: "Thanks to the bitches at **YT HQ** are music commands ``currently unavailable`` since YT prohibits access to video streams via bots."
        })]
    })
}