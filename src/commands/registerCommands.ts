import {CommandCategory, CommandTypes} from "./types.js";
import {Client, Collection} from "discord.js";
import debug from "./debug/index.js";

export async function registerCommands(client: Client, commands: Record<string, CommandCategory>) {

    const allCommands = Object.values(commands).flatMap(({ commands }) => commands)

    if (!client.application) throw new Error("Client.application was not defined.")
    client.application.commands.set(Object.values(commands).flatMap(({ commands }) => commands).map(({data}) => data)).then(commands => {
        commands.forEach( command => {
            const rawCommand = client.commands.get(command.name)

            if (rawCommand) {
                rawCommand.id = command.id
                client.commands.set(command.name, rawCommand)
            }
        })
    })
}

class Commands {
    // private allCommands = new Collection<string, CommandTypes>
    private categories = new Collection<string, Collection<string, CommandTypes>>()

    /**
     * Searches for command with a given name.
     */
    getCommand(key: string | CommandTypes): CommandTypes | undefined {
        for (const commands of this.categories.values()) {
            const foundCommand = commands.find(cmd =>
                typeof key === "string" ? cmd.data.name === key : cmd === key
            );
            if (foundCommand) return foundCommand;
        }
        return undefined;
    }
    /**
     * Searches for category with a given name or for a category, that includes a command with that name.
     */
    getCategory(key: string | CommandTypes): Collection<string, CommandTypes> | undefined {
        if (typeof key === "string") {
            const result = this.categories.get(key);
            if (result) return result;
        }
        return this.categories.find(commands =>
            commands.some(command =>
                typeof key === "string" ? command.data.name === key : command === key
            )
        );
    }
}

// TODO: I want to make it possible to search for a CommandCategory type with the key of the name or a membercommand, i also want a collection of commands
// possible solution: dont have command in correspondig category and only info in there and somehow map commands to that category
// have multiple collections


export const commands = {
    data: {
        debug
    },

    /**
     * Searches for command with a given name.
     * @param key
     */
    getCommand(key: string | CommandTypes) {
        return Object.values(this.data).flatMap(({commands}) => commands).find( (command) => {
            return command.data.name === key || command === key;
        })
    },
    /**
     * Searches for category with a given name or for a category, that includes a command with that name.
     * @param key
     */
    getCategory(key: string| CommandTypes){

        if (typeof key === "string"){
            const result = (this.data as Record<string, CommandCategory>)[key]
            if (result) return result
        }
        return Object.values(this.data).find( ({commands}) => {
            return commands.find( (command) => {
                return command.data.name === key || command === key;
            });
        })
    }
}