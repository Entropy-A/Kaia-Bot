import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {help} from "./help.js";
import {Emojis} from "../../config/index.js";

export default new CommandCategory ({
    id: "general",
    name: text.commands.categories.general.name,
    commands: new Collection<string, CommandTypes>()
        .set(help.data.name, help),
    emoji: Emojis.generalIcon, // TODO: Custom
    description: text.commands.categories.general.description,
})