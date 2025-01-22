import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {ping} from "./ping.js";
import {Emojis} from "../../config/index.js";

export default new CommandCategory ({
    id: "debug",
    name: text.commands.categories.debug.name,
    commands: new Collection<string, CommandTypes>()
        .set(ping.data.name, ping),
    emoji: Emojis.debugIcon,
    description: text.commands.categories.debug.description,
})