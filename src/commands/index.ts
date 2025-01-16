import {CommandCategory, CommandTypes} from "./types.js";
import {Collection} from "discord.js";
export * from "./types.js"
export * from "./registerCommands.js"
export * from "./handleCommands.js"

import debug from "./debug/index.js"

export interface Commands {
    categories: Collection<string, CommandCategory>,
    getCommand(key: string | CommandTypes): CommandTypes | undefined,
    getCategory(key: string | CommandTypes): CommandCategory | undefined
}

export const commands: Commands = {
    // Register categories:
    categories: new Collection<string, CommandCategory>()
        .set(debug.name, debug),

    /**
     * Searches for command with a given name.
     */
    getCommand(key: string | CommandTypes): CommandTypes | undefined {
        const commands = this.categories.flatMap(({commands}) => commands)
        if (typeof key === "string") return commands.get(key)
        else return commands.find((command) =>
            command === key
        )
    },
    /**
     * Searches for category with a given name or for a category, that includes a command with that name.
     */
    getCategory(key: string | CommandTypes): CommandCategory | undefined {
        if (typeof key === "string") {
            const result = this.categories.get(key);
            if (result) return result;
        }
        return this.categories.find(category =>
            category.commands.some(command =>
                typeof key === "string" ? command.data.name === key : command === key
            )
        );
    }
}