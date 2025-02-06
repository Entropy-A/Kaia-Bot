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
                if (!command.success) return await handleError(interaction, logger, command.error)

                switch (true) {
                    case command.data.type === 1 && interaction.isChatInputCommand():
                        return executeChatInputCommand(interaction, command.data as Command<ChatInputApplicationCommandData>, client);

                    case command.data.type === 2 && interaction.isUserContextMenuCommand():
                        return

                    case command.data.type === 3 && interaction.isMessageContextMenuCommand():
                        return
                }
            }
        } catch (e) {
            await handleError(interaction, logger, e);
        }
    }
})