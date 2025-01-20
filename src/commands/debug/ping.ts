import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {ButtonStyle, ChatInputApplicationCommandData, ChatInputCommandInteraction} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {ButtonGenerator, EmbedGenerator} from "../../utils/index.js";
import {Button} from "../../types/index.js";


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
    const button1 = new Button({id: "button1", generator: ButtonGenerator.create({
            label: "to ping 2",
            style: ButtonStyle.Primary
        }), callback: ({interaction}) => {
            anchor.update(interaction, ping2);
        }})
    const button2 = new Button({id: "button2", generator: ButtonGenerator.create({
            label: "to ping 1",
            style: ButtonStyle.Primary
        }), callback: ({interaction}) => {
            anchor.update(interaction, ping1);
        }, visibilityCallback: () => {
            return true
        }
    })

    const ping1 = new Page({id: "ping1", embeds: [EmbedGenerator.create({description: "Ping 1.", title: "Ping 1"})], color: Colors.debug, components: [[button1, button2]]})
    const ping2 = new Page({id: "ping2", embeds: [EmbedGenerator.create({description: "Ping 2.", title: "Ping 2"})], color: Colors.debug, components: [[button2]]})

    const anchor = await ping1.send(interaction)
    return anchor
}

export const ping = new Command({data, icon, color, description, callback})