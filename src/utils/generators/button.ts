import { ButtonBuilder, ButtonStyle, ButtonComponentData} from "discord.js";
import { GeneratorDataMap } from "../../types/index.js"
import { Emojis } from "../../config/index.js";

type Data = GeneratorDataMap<ButtonBuilder>

export class ButtonGenerator extends ButtonBuilder {
    public static Menu(data?: Data) {
        return this.create(data)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Menu") //TODO Dynamic text in Future
    }

    public static Link(label: string, url: string, emoji?: Emojis, data?: Data) {
        return this.create({...data, emoji})
            .setStyle(ButtonStyle.Link)
            .setLabel(label)
            .setURL(url)
    }

    public static Back(data?: Data) {
        return this.create(data)
            .setStyle(ButtonStyle.Primary)
            .setLabel("Back") //TODO Dynamic text in Future
    }

    public static Next(data?: Data) {
        return this.create(data)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:arrowRight:1231357089083817994>") // TODO Better
    }

    public static newReminder(data?: Data) {
        return this.create(data)
            .setStyle(ButtonStyle.Success)
            .setEmoji("➕")
            .setLabel("New Reminder")
    }

    public static create(data?: Data) {
        return new ButtonBuilder(data as ButtonComponentData)
    }
}