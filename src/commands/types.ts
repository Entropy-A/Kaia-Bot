import {LocaleText} from "../text/loadText.js";
import {
    ApplicationCommandData,
    ApplicationCommandType,
    Awaitable,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction, Collection,
    CommandInteraction,
    MessageApplicationCommandData,
    MessageContextMenuCommandInteraction,
    UserApplicationCommandData,
    UserContextMenuCommandInteraction
} from "discord.js";
import {BaseCallback} from "../types/index.js";
import {Colors, Images} from "../config/index.js";

export enum CommandCategoryIds {
    debug = "debug",
    general = "general",
    music = "music",
    statistics = "statistics",
}

type CommandInteractionMap<D extends ApplicationCommandData> =
    D extends ChatInputApplicationCommandData ? ChatInputCommandInteraction :
    D extends MessageApplicationCommandData ? MessageContextMenuCommandInteraction :
    D extends UserApplicationCommandData ? UserContextMenuCommandInteraction :
    never

// TODO: maybe explain other Database of command like messageContextCommand
interface CommandDetailedDescription {
    title: LocaleText,
    description: LocaleText,
    syntax: LocaleText,
    returns: LocaleText
}

export type CommandCallback<I extends CommandInteraction> = BaseCallback<Awaitable<unknown>, I>;

interface CommandData<D extends ApplicationCommandData> {
    data: D,
    detailedDescription: CommandDetailedDescription,
    icon: Images,
    color: Colors,
    callback: CommandCallback<CommandInteractionMap<D>>
}

/**
 * Class for command handling.
 */
export class Command<D extends ApplicationCommandData> implements CommandData<D> {

    /**
     * String to refer to a command after it has been registered.
     */
    public id?: string;
    /**
     * Type to specify how it is handled.
     */
    public readonly type: ApplicationCommandType;

    public readonly data: D;
    public readonly icon;
    public readonly color;
    public readonly detailedDescription
    public readonly callback;

    /**
     * @param data.data Data in form of object.
     */
    constructor (data: CommandData<D>) {
        if (!data.data.type) throw new Error("Command type not defined.")
        this.data = data.data
        this.type = data.data.type
        this.icon = data.icon
        this.color = data.color
        this.detailedDescription = data.detailedDescription
        this.callback = data.callback
    }
}

export type CommandTypes = Command<ChatInputApplicationCommandData> | Command<UserApplicationCommandData> | Command<MessageApplicationCommandData>


interface CommandCategoryData {
    id: CommandCategoryIds,
    name: LocaleText,
    commands: Collection<string, CommandTypes>,
    description?: LocaleText,
    emoji?: string,
    documentationLink?: string
}
/**
 * Class to further specify a group of commands.
 */
export class CommandCategory implements CommandCategoryData{

    public readonly id
    public readonly name;
    /**
     * Array of commands that belong to that category.
     */
    public readonly commands;
    public readonly description?;
    public readonly emoji?;
    public readonly documentationLink?;

    constructor (data: CommandCategoryData) {
        this.id = data.id
        this.name = data.name
        this.commands = data.commands
        this.description = data.description
        this.emoji = data.emoji
        this.documentationLink = data.documentationLink
    }
}