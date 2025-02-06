import {CommandCategory, CommandTypes} from "./types.js";
import {Collection} from "discord.js";
export * from "./types.js"
export * from "./registerCommands.js"
export * from "./handleCommands.js"

import debug from "./debug/index.js"
import general from "./general/index.js";
import music from "./music/index.js";
import statistics from "./statistics/index.js";
import {Result} from "../types/result.js";

export interface Commands {
    categories: Collection<string, CommandCategory>,
    getCommand(key: string | CommandTypes): Result<CommandTypes>,
    getCategory(key: string | CommandTypes): Result<CommandCategory>
}

export const commands: Commands = {
    // Register categories:
    categories: new Collection<string, CommandCategory>()
        .set(general.id, general)
        .set(statistics.id, statistics)
        .set(music.id, music)

        .set(debug.id, debug),

    /**
     * Searches for command with a given name.
     */
    getCommand(key: string | CommandTypes) {
        let command
        const commands = this.categories.flatMap(({commands}) => commands)

        if (typeof key === "string") command = commands.get(key)
        else command = commands.find((command) =>
            command === key
        )
        return command ? {success: true, data: command} : {success: false, error: new Error(`Could not find command: [${key}]`)}
    },
    /**
     * Searches for category with a given name or for a category, that includes a command with that name.
     */
    getCategory(key: string | CommandTypes) {
        let category: CommandCategory | undefined

        if (typeof key === "string") category = this.categories.get(key);
        if (!category) category = this.categories.find(category =>
            category.commands.some(command =>
                typeof key === "string" ? command.data.name === key : command === key
            )
        )
        return category ? {success: true, data: category} : {success: false, error: new Error(`Could not find category with name or command member: [${key}]`)}
    }
}