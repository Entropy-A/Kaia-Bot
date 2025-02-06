import {
    Locale,
    SelectMenuComponentOptionData,
    UserSelectMenuBuilder
} from "discord.js";
import {GeneratorDataMap} from "./index.js";

import {UserSelectMenuComponentData} from "discord.js";

type UserData = GeneratorDataMap<UserSelectMenuBuilder>

export class UserSelectGenerator extends UserSelectMenuBuilder {
    public static statsAddUser(locale: Locale): UserSelectGenerator {
        const options: SelectMenuComponentOptionData[] = []

        return this.create({
            placeholder: "Select users that have access to your stat (max 25)", // TODO: language
            minValues: 0,
            maxValues: 25,
        })
    }

    public static create(data?: UserData) {
        return new UserSelectMenuBuilder(data)
    }
}