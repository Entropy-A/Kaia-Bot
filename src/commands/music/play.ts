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
import {
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
    NoSubscriberBehavior
} from "@discordjs/voice";

import playdl from 'play-dl';

const color = Colors.gray
const icon = Images.playIcon
const detailedDescription = text.commands.play.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "play",
    description: text.commands.play.description.get(Locale.EnglishUS),
    descriptionLocalizations: _.omit(text.commands.play.description.locals, "en-US"),
    options : [{
        name: "title",
        description: text.commands.play.optionDescription.get(Locale.EnglishUS),
        descriptionLocalizations: _.omit(text.commands.play.optionDescription.locals, "en-US"),
        type: 3,
        required: true,
    }],
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

export function CURRENTLYNOTAVAILABLE() {
    return new Page({
        id: "musicNotAvailable",
        embeds: [EmbedGenerator.create({
            color: Colors.error,
            author: {iconURL: Images.errorIcon, name: "Music commands currently unavailable."},
            description: "Thanks to the bitches at **YT HQ**, music commands are ``currently unavailable`` since YT prohibits access to video streams via bots."
        })]
    })
}
