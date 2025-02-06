import {Colors, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ButtonStyle,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction, Embed, Interaction,
    Locale,
} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback} from "../index.js";
import {Page, PageAnchor} from "../../types/pages.js";
import {
    ButtonGenerator,
    EmbedGenerator,
    handleError,
    ModalGenerator, StaticLogger,
    StringSelectGenerator
} from "../../utils/index.js";
import {useDatabase} from "../../hooks/useDatabase.js";
import {Button, UserSelect} from "../../types/index.js";
import {t} from "../../config/index.js"
import {UserSelectGenerator} from "../../utils/generators/userSelect.js";
import {Stat, StatEntry} from "../../Database/types/index.js";
import {DbGuild, MongoDB} from "../../Database/index.js";
import {IStat, IStatEntry, MStat} from "../../Database/schemas/index.js";
import {Types} from "mongoose";

const color = Colors.gray
const icon = Images.statsIcon
const detailedDescription = text.commands.statistics.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "stats",
    description: text.commands.statistics.description.get(Locale.EnglishUS),
    descriptionLocalizations: _.omit(text.commands.statistics.description.locals, "en-US"),
    type: 1
}

const currentObject = new Map<string, IStat | IStatEntry>
const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        const anchor = await loadingPage(interaction.locale).send(interaction)
        const locale = interaction.locale
        const guildId = interaction.guildId
        if (!guildId) throw new Error("cannot use this command outside of a guild"); //TODO custom

        // Database connection:
        const db = useDatabase()
        const guild = await db.getGuild(guildId) ?? await db.addGuild(guildId)
        const accessibleStats = await guild.getAllStats({requestUserId: interaction.user.id})

        // 1. level Pages:
        if (!accessibleStats) {
            await anchor.update(interaction, noStatsFoundPage(locale)
                .addComponentRows([
                    [newStat_Button(anchor, logger, guild, locale)]
                ]))
        }
        else {
            await anchor.update(interaction, mainPage(locale, accessibleStats)
                .addComponentRows([
                    [newStat_Button(anchor, logger, guild, locale)]
                ]))
        }

    } catch (error) {
        await handleError(interaction, logger, error)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})

function saveChanges_Button(anchor: PageAnchor, logger: StaticLogger, guild: DbGuild, locale: Locale) {
    return new Button({
        id: "saveChanges",
        generator: ButtonGenerator.create({style: ButtonStyle.Primary, label: "save"}),
        callback: async ({interaction}) => {
            const object = currentObject.get(interaction.user.id)

            if (object instanceof MStat) {
                await guild.addStat(object) // TODO: maybe pass IStat interface directly
                currentObject.delete(interaction.user.id)
            }
            else throw new Error("cannot save changes");

            await anchor.update(interaction, changesSavedPage(locale))
        }
    })
}

function addUser_SelectMenu(locale: Locale) {
    return new UserSelect({
        id: "selectUsers",
        generator: UserSelectGenerator.statsAddUser(locale),
        callback: async ({interaction}) => {
            const object = currentObject.get(interaction.user.id)
            if (!object) return

            object.permittedUsers = await MongoDB.getUsers(interaction.values)
            currentObject.set(interaction.user.id, object) // TODO change to string -> user id directly
            await interaction.reply("added users")
        }
    })
}

function newStat_Button(anchor: PageAnchor, logger: StaticLogger, guild: DbGuild, locale: Locale) {
    const newStatModal = ModalGenerator.NewStat(locale)
    return new Button({
        id: "newStat",
        generator: ButtonGenerator.NewStats(),
        callback: async ({interaction}) => {
            await interaction.showModal(newStatModal)
            const filter = (i: Interaction) => i.user.id === interaction.user.id
            const owner = await MongoDB.getUser(interaction.user.id)

            try {
                const newStatModalInteraction = await interaction.awaitModalSubmit({time: 3 * t.min, filter})

                const name = newStatModalInteraction.fields.getField("name").value
                const description = newStatModalInteraction.fields.getField("description").value

                currentObject.set(interaction.user.id, new MStat({name, description, owner})) // Stets new stat in temp map

                await anchor.update(newStatModalInteraction, newStatSummaryPage(name, description, locale)
                    .addComponentRows([
                        [addUser_SelectMenu(locale)],
                        [saveChanges_Button(anchor, logger, guild, locale)]
                    ]))
            } catch (e) {
                logger.info("Modal submit failed.")
            }

        }
    })
}

function loadingPage(locale: Locale) {
    return new Page({
        id: "loadingPage",
        embeds: [EmbedGenerator.Command(color, Images.loadingIcon, "Waiting for database response...")]
    })
}

function newStatSummaryPage(name:string, description: string, locale: Locale) {
    return new Page({
        id: "newStatSummaryPage",
        embeds: [EmbedGenerator.Command(color, Images.statsAddIcon, "Are you finished with this stat?")
            .setDescription("You can add users that can have access with the ``selection bar`` below.")
            .setFields([
                {name: "Name:", value: name},
                {name: "Description:", value: description}
            ])
        ]
    })
}

function changesSavedPage(locale: Locale) {
    return new Page({
        id: "changesSavedPage",
        embeds: [EmbedGenerator.Command(color, Images.statsAddIcon, "Saved changes")
        ]
    })
}

function mainPage(locale: Locale, stats: Stat[]) {
    const embed = EmbedGenerator.Command(color, icon, "Let's look at what we got.", {
        description: "List of your stats."
    })
    for (const stat of stats) {
        embed.addFields({name: "``" + `${stat.name}` + "``", value: stat.description})
    }

    return new Page({
        id: "mainPage",
        embeds: [embed],
    })
}

function noStatsFoundPage(locale: Locale) {
    return new Page({
        id: "noStatsFound",
        embeds: [EmbedGenerator.Command(color, icon, "Oh noo....", {
            description: "It looks like you have no stats on this server :( \n Do you want to create a new Statistic?"
        })],
    })
}

type component = () => boolean