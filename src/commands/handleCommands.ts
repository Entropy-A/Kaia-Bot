import {ChatInputApplicationCommandData, ChatInputCommandInteraction, Client} from "discord.js";
import {Command} from "./types.js";
import {LoggerType, StaticLogger} from "../utils/index.js";

export async function executeChatInputCommand(interaction: ChatInputCommandInteraction, command: Command<ChatInputApplicationCommandData>, client: Client) {
    const logger = new StaticLogger(LoggerType.COMMAND, command.data.name)
    return command.callback({ client, interaction, logger })
}
