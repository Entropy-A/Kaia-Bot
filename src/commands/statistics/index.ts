import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {Emojis} from "../../config/index.js";
import {CommandCategoryIds} from "../index.js";

import stats from "./stats.js"

export default new CommandCategory ({
    id: CommandCategoryIds.statistics,
    name: text.commands.categories.statistics.name,
    commands: new Collection<string, CommandTypes>()
        .set(stats.data.name, stats),
    emoji: Emojis.statisticsIcon,
    description: text.commands.categories.statistics.description,
})