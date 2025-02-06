import {ApplicationCommandData, Client} from "discord.js";
import {commands, Commands} from "./index.js";
import {syslog} from "../utils/index.js";

export async function registerCommands(client: Client, commands: Commands) {
    if (!client.application) throw new Error("Client.application was not defined.")

    const allCommands: ApplicationCommandData[] = [];
    commands.categories.forEach(category => {
        category.commands.forEach(command => {
            allCommands.push(command.data);
        });
    });
    client.application.commands.set(allCommands).then(registeredCommands => {
        registeredCommands.forEach( command => {
            const rawCommand = commands.getCommand(command.name)
            const category = commands.getCategory(command.name);
            if (rawCommand.success && category.success) {
                rawCommand.data.id = command.id
                category.data.commands.set(command.name, rawCommand.data);
            } else throw new Error(`Command: [${command.name}] Could not set command id.`)
        })
    }).then(() => {
        syslog.log("Command registration", "Commands registered.");
    });
}


