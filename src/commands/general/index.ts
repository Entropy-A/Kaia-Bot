import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {Emojis} from "../../config/index.js";
import {CommandCategoryIds} from "../index.js";

import help from "./help.js";

export default new CommandCategory ({
    id: CommandCategoryIds.general,
    name: text.commands.categories.general.name,
    commands: new Collection<string, CommandTypes>()
        .set(help.data.name, help),
    emoji: Emojis.generalIcon,
    description: text.commands.categories.general.description,
})