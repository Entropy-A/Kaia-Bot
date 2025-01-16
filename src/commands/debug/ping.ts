import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {ChatInputApplicationCommandData, ChatInputCommandInteraction, CommandInteraction} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";


const color = Colors.debug
const icon = Images.pingIcon
const description = text.commands.ping.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "ping",
    description: text.commands.ping.commandDescription.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.ping.commandDescription.locals, "en-US"),
    type: 1
}


const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    logger.log("pong");
}

export const ping = new Command({data, icon, color, description, callback})