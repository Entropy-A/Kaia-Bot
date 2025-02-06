import {Locale, SelectMenuComponentOptionData, StringSelectMenuBuilder} from "discord.js";
import {GeneratorDataMap} from "./index.js";
import {commands} from "../../commands/index.js";
import {text} from "../../text/loadText.js";

type StringData = GeneratorDataMap<StringSelectMenuBuilder>

export class StringSelectGenerator extends StringSelectMenuBuilder {
    public static helpSelectMenu(locale: Locale) {
        // TODO Add list for other kinds of commands like userCommand. / Add type of command to help
        const options: SelectMenuComponentOptionData[] = []

        commands.categories.map((category) => {
            const emoji = category.emoji
            for (const command of category.commands.values()) {
                const option: SelectMenuComponentOptionData = {
                    label: `/${command.data.name}`,
                    // Description only awailable on ChatInput.
                    description: (command.data.type === 1 ) ? command.data.description : undefined,
                    value: command.data.name,
                    emoji
                }
                options.push(option)
            }
        })

        return this.create({
            placeholder: text.commands.help.selectMenuPlaceholder.get(locale),
            maxValues: 1,
            options
        })
    }

    public static create(data?: StringData) {
        return new StringSelectMenuBuilder(data)
    }
}