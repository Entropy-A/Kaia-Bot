import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction, Embed, Interaction,
    Locale,
} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page} from "../../types/pages.js";
import {ButtonGenerator, EmbedGenerator, handleError, ModalGenerator} from "../../utils/index.js";
import {useDatabase} from "../../hooks/useDatabase.js";
import {Stat} from "./statTypes/statTypes.js";
import { Button } from "../../types/index.js";
import {t} from "../../config/index.js"

const color = Colors.gray
const icon = Images.statsIcon
const detailedDescription = text.commands.statistics.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "stats",
    description: text.commands.statistics.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.statistics.description.locals, "en-US"),
    type: 1
}
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        const anchor = await loadingPage(interaction.locale).send(interaction)
        const locale = interaction.locale
        const guildId = interaction.guildId

        const newStatModal = ModalGenerator.NewStat(locale)

        const newStatButton = new Button({
            id: "newStat",
            generator: ButtonGenerator.NewStats(),
            callback: async ({interaction}) => {
                await interaction.showModal(newStatModal)
                const filter = (i: Interaction) => i.user.id === interaction.user.id

                const feedback = await interaction.awaitModalSubmit({time: t.min, filter})

                //TODO on timeout
            }
        })

        // Database connection:
        const db = useDatabase().stats
        if (!guildId) throw new Error("cannot use this command outside of a guild"); //TODO custom
        const guildDb = await db.getGuild(guildId)
        if (!guildDb) await db.addGuild(guildId);

        const accessibleStats = await guildDb?.getStats({requestUserId: interaction.user.id})

        // 1. level Pages:
        if (!accessibleStats) {
            const noStatsFoundPage = noStatsFoundPage_(locale).addComponentRows([
                [newStatButton]
            ])

            await anchor.update(interaction, noStatsFoundPage)
        }
        else {
            const mainPage = mainPage_(locale, accessibleStats).addComponentRows([
                [newStatButton]
            ])

            await anchor.update(interaction, mainPage)
        }

    } catch (error) {
        await handleError(interaction, logger, error)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})

function loadingPage(locale: Locale) {
    return new Page({
        id: "loadingPage",
        embeds: [EmbedGenerator.Command(color, Images.loadingIcon, "Waiting for database response...")]
    })
}

function mainPage_(locale: Locale, stats: Stat[]) {
    const embed = EmbedGenerator.Command(color, icon, "Let's look at what we got.", {
        description: "List of your stats."
    })
    for (const stat of stats) {
        embed.addFields({name: `$\`\`{stat.name}\`\``, value: stat.description})
    }

    return new Page({
        id: "mainPage",
        embeds: [embed],
    })
}

function noStatsFoundPage_(locale: Locale) {
    return new Page({
        id: "noStatsFound",
        embeds: [EmbedGenerator.Command(color, icon, "Oh noo....", {
            description: "It looks like you have no stats on this server :( \n Do you want to create a new Statistic?"
        })],
    })
}