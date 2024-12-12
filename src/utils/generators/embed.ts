import {GeneratorDataMap} from "./index.js";
import {Embed, EmbedBuilder, LocaleString} from "discord.js";
import {Colors, Images} from "../../config/index.js";
import {ExpectedError} from "../errors/index.js";
import {text} from "../../text/loadText.js";

type Data = GeneratorDataMap<EmbedBuilder>

export class EmbedGenerator extends EmbedBuilder {
    public static create(data?: Data) {
        return new EmbedGenerator(data);
    }

    public static error(error: Error | ExpectedError, locale: LocaleString, data?: Data) {
        const embed = new EmbedBuilder(data).setColor(Colors.error)//.setThumbnail();;

        if (error instanceof ExpectedError) {
            // If no title, error is treated as quick error and message is the title.
            const title = error.title ?? error.message;
            embed.setAuthor({iconURL: Images.errorIcon, name: title.get(locale)});
            if (error.title) {
                embed.addFields({name: text.error.embedLayout.description.get(locale), value: error.message.get(locale)})
            }
            if (error.cause) {
                embed.addFields({name: text.error.embedLayout.cause.get(locale), value: error.cause.get(locale)});
            }
        } else {
            embed
                .setAuthor({iconURL: Images.errorIcon, name: text.error.UNEXPECTED_ERROR.title.get(locale)})
                .setDescription(text.error.UNEXPECTED_ERROR.message.get(locale))
        }
        return embed
    }
}
