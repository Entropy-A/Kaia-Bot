import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {Emojis} from "../../config/index.js";
import {CommandCategoryIds} from "../index.js";

import ping from "./ping.js";

export default new CommandCategory ({
    id: CommandCategoryIds.debug,
    name: text.commands.categories.debug.name,
    commands: new Collection<string, CommandTypes>()
        .set(ping.data.name, ping),
    emoji: Emojis.debugIcon,
    description: text.commands.categories.debug.description,
})