import {Event} from "../types.js";
import {handleError} from "../../utils/index.js";
import {Command, commands, executeChatInputCommand} from "../../commands/index.js";
import {ChatInputApplicationCommandData} from "discord.js";

export default new Event({
    key: "interactionCreate",
    callback: async ({client, logger}, interaction) => {
        try {
            if (interaction.isCommand()) {
                const name = interaction.commandName
                const command = commands.getCommand(name);
                if (!command) throw new Error(`Could not resolve command with name: "${name}"`);

                switch (true) {
                    case command.type === 1 && interaction.isChatInputCommand():
                        return executeChatInputCommand(interaction, command as Command<ChatInputApplicationCommandData>, client);

                    case command.type === 2 && interaction.isUserContextMenuCommand():
                        return

                    case command.type === 3 && interaction.isMessageContextMenuCommand():
                        return
                }
            }
        } catch (e) {
            handleError(interaction, e, logger);
        }
    }
})