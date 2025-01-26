import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {ButtonStyle, ChatInputApplicationCommandData, ChatInputCommandInteraction, LocaleString} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {ButtonGenerator, EmbedGenerator, handleError} from "../../utils/index.js";
import {Button} from "../../types/index.js";

const color = Colors.gray
const icon = Images.pingIcon
const detailedDescription = text.commands.ping.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "ping",
    description: text.commands.ping.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.ping.description.locals, "en-US"),
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        const locale = interaction.locale
        const anchor = await checkPing(locale).send(interaction, undefined, true)
        const timeStamp = await interaction.fetchReply();
        const pingValue = timeStamp.createdTimestamp - interaction.createdTimestamp

        await anchor.update(interaction, pingPage(locale, pingValue))

    } catch (error) {
        await handleError(interaction, error, logger)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})

function checkPing(locale: LocaleString) {
    return new Page({
        id: "pinging...",
        embeds: [EmbedGenerator.Command(color, Images.loadingIcon, "Waiting for response...")]
    })
}
function pingPage(locale: LocaleString, pingValue: number): Page {
    const ping = ` \`${pingValue}ms\` `;
    const title = text.commands.ping.title.get(locale);
    let message: string
    if (pingValue < 250) {
        message = text.commands.ping.message.close.insertInMessage([ping], locale);
    } else if (pingValue < 500) {
        message = text.commands.ping.message.normal.insertInMessage([ping], locale);
    } else {
        message = text.commands.ping.message.slow.insertInMessage([ping], locale);
    }

    return new Page({
        id: "ping",
        embeds: [EmbedGenerator.Command(color, icon, title, {description: message})]
    })
}