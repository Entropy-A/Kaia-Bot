import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {Emojis} from "../../config/index.js";
import {CommandCategoryIds} from "../index.js";

import {play} from "./play.js";

export default new CommandCategory ({
    id: CommandCategoryIds.music,
    name: text.commands.categories.music.name,
    commands: new Collection<string, CommandTypes>()
        .set(play.data.name, play),
    emoji: Emojis.musicIcon,
    description: text.commands.categories.music.description,
})