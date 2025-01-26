import {CommandCategory, CommandTypes} from "../types.js";
import {text} from "../../text/loadText.js"
import {Collection} from "discord.js";
import {Emojis} from "../../config/index.js";
import {CommandCategoryIds} from "../index.js";

import play from "./play.js";
import pause from "./pause.js";
import resume from "./resume.js";
import skip from "./skip.js";

export default new CommandCategory ({
    id: CommandCategoryIds.music,
    name: text.commands.categories.music.name,
    commands: new Collection<string, CommandTypes>()
        .set(play.data.name, play)
        .set(pause.data.name, pause)
        .set(resume.data.name, resume)
        .set(skip.data.name, skip),
    emoji: Emojis.musicIcon,
    description: text.commands.categories.music.description,
})