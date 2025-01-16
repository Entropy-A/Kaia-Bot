import { StringSelectMenuBuilder, StringSelectMenuComponentData} from "discord.js";
import { GeneratorDataMap} from "../../types/index.js"

type StringData = GeneratorDataMap<StringSelectMenuBuilder>

export class StringSelectGenerator extends StringSelectMenuBuilder {

    public static create(data?: StringData) {
        return new StringSelectMenuBuilder(data as StringSelectMenuComponentData)
    }
}