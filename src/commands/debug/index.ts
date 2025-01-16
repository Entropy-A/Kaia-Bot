import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {ping} from "./ping.js";

export default new CommandCategory ({
    name: "debug",
    title: text.commands.categorys.debug.name,
    commands: new Collection<string, CommandTypes>()
        .set(ping.data.name, ping),
    //emoji: Emojis.debugIcon, // TODO: Custom
    description: text.commands.categorys.debug.description,
})