import {Colors, Emojis, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    SelectMenuComponentOptionData,
    Locale,
} from "discord.js";
import _ from "underscore";
import {Command, CommandCallback, commands} from "../index.js";
import {ButtonGenerator, EmbedGenerator, handleError, StringSelectGenerator} from "../../utils/index.js";
import {Button, DynamicEmbedUpdate, Page, PageMenu, PageMenuCategory, StringSelect} from "../../types/index.js";

const color = Colors.gray
const icon = Images.helpIcon
const detailedDescription = text.commands.help.detailedDescription
const data: ChatInputApplicationCommandData = {
    name: "help",
    description: text.commands.help.description.get(Locale.EnglishUS),
    descriptionLocalizations: _.omit(text.commands.help.description.locals, "en-US"),
    type: 1
}

enum ComponentIds {
    nextButton = "nextButton",
    backButton = "backButton",
    menu = "menu",
    website = "website",
    invite = "invite",
    dcServer = "dcServer",
}

const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        const selectMenu: [StringSelect] = [
            new StringSelect({
                id: "selectCommand",
                generator: StringSelectGenerator.helpSelectMenu(interaction.locale),
                callback: async ({interaction}) => {
                    const newPage = menu.getPage(interaction.values[0])?.page
                    if (!newPage) return handleError(interaction, logger, new Error(`Did not find command with name: [${interaction.values[0]}] from stringSelect.`))

                    await menu.update(interaction, newPage)
                }
            })
        ]

        const navigationVisCallback = () => {
            return !(!menu.currentPage || menu.currentPage.page.data.id === "mainPage");
        }

        const linkVisCallback = () => {
            return !(!menu.currentPage || !(menu.currentPage.page.data.id === "mainPage"));
        }

        const navigationButtons: [Button, Button, Button] = [
            new Button({
                id: ComponentIds.backButton,
                generator: ButtonGenerator.Back(),
                visibilityCallback: navigationVisCallback,
                callback: async ({interaction}) => {
                    await menu.defaultButtonCallbacks.absoluteBack(interaction, [0])
                }
            }),
            new Button({
                id: ComponentIds.menu,
                generator: ButtonGenerator.Menu(),
                visibilityCallback: navigationVisCallback,
                callback: async ({interaction}) => {
                    await menu.update(interaction, "mainPage")
                }
            }),
            new Button({
                id: ComponentIds.nextButton,
                generator: ButtonGenerator.Next(),
                visibilityCallback: navigationVisCallback,
                callback: async ({interaction}) => {
                    await menu.defaultButtonCallbacks.absoluteNext(interaction, [0])
                }
            })
        ]

        const linkButtons: [Button, Button, Button] = [
            new Button({
                id: ComponentIds.website,
                generator: ButtonGenerator.Link("Website", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.botWebsite),
                visibilityCallback: linkVisCallback,
            }),
            new Button({
                id: ComponentIds.invite,
                generator: ButtonGenerator.Link("Invite me!", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.add),
                visibilityCallback: linkVisCallback,
            }),
            new Button({
                id: ComponentIds.dcServer,
                generator: ButtonGenerator.Link("My guild!", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.dcServer),
                visibilityCallback: linkVisCallback,
            })
        ]

        const menu = new PageMenu({id: "helpMenu"})
            .addCategories(mainPage(interaction.locale))
            .addCategories(detailedHelpPages(interaction.locale))
            .addGlobalComponentRows([
                selectMenu,
                navigationButtons,
                linkButtons,
            ])
            .addDynamicEmbedUpdates([dynamicEmbedUpdate(interaction.locale)])

        await menu.send("mainPage", interaction, undefined, true)

    } catch (e) {
        await handleError(interaction, logger, e)
    }
}

// ! Command export.
export default new Command({data, icon, color, detailedDescription, callback})

function dynamicEmbedUpdate(locale: Locale): DynamicEmbedUpdate {
    return (page, menu) => {
        const pageInfo = menu.getPage(page)
        const categoryInfo = menu.getCategoryByPage(page)
        if (!pageInfo || !categoryInfo || page.data.id === "mainPage") return page.data.embeds

        const category_ = commands.getCategory(categoryInfo.category.id)
        if (!category_.success) throw category_.error

        const emoji = category_.data.emoji ?? ""
        const index = pageInfo.index + 1
        const category = categoryInfo.category
        const categoryLink = category_.data.documentationLink ?? "https://www.youtube.com/watch?v=d43lJsK7Kvo"

        const name = "\u200B"
        const value = text.commands.help.detailedInfoPage.footer.insertInMessage([
            emoji,
            (text.commands.categories as any)[category.id].name.get(locale),
            categoryLink,
            index.toString(),
            Object.values(category.pages).length.toString()
        ], locale)

        // That the fields don't get added multiple times if called repeatedly.
        const fields = page.data.embeds?.[0]?.data.fields
        if (!fields) return page.data.embeds
        if (fields?.length > 2) fields.pop()
        fields.push({name, value})
        page.data.embeds?.[0]?.setFields(fields)

        return page.data.embeds
    }
}

function mainPage(locale: Locale): PageMenuCategory[] {
    // Menu page with bottom to fix Size.
    const menuEmbed = EmbedGenerator.Command(color, icon, text.commands.help.menu.title.get(locale), {
            description: text.commands.help.menu.description.get(locale),
            thumbnail: {url: Images.avatar},
        }
    )

    // Menu fields for every category
    for (const category of commands.categories.values()) {
        // Get the commands in a string to make them possibly clickable.
        const commands = []
        for (const command of category.commands.values()) {
            const string: string = command.id ? `• </${command.data.name}:${command.id}>` : `• **${command.data.name}`
            commands.push(string)
        }
        menuEmbed.addFields({
            name: `${category.emoji ?? "" } ${category.name.get(locale)}`,
            value: commands.join(" ") + "\n" + (category.description?.get(locale) ?? ""),
            inline: false
        })
    }

    // * Footer Fields
    menuEmbed.addFields(
        // ? Replaced by buttons.
        ////    {name: "Website", value: "[ranni.vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
        ////    {name: "Invite me!", value: "[Ranni Vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
        ////    {name: "Join me guild!", value: "[Ranni's Tower](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
        {name: "\u200B", value: text.commands.help.menu.credits.get(Locale.EnglishUS), inline: false}
    )

    return [{ id: "mainPage", pages: { "mainPage": new Page({id: "mainPage", embeds: [menuEmbed]})}}]
}

function detailedHelpPages(locale: Locale): PageMenuCategory[] {
    // Creates autoPages for every command.
    const commandPages: PageMenuCategory[] = []
    for (const category of commands.categories.values()) {

        const pages: Record<string, Page> = {}
        for (const command of category.commands.values()) {
            const title = command.detailedDescription.title.get(locale)
            const description = command.detailedDescription.description.get(locale)
            const syntax = command.detailedDescription.syntax.get(locale)
            const returns = command.detailedDescription.returns.get(locale)

            pages[command.data.name] = new Page({
                id: command.data.name,
                embeds: [EmbedGenerator.Command(color, icon, text.commands.help.detailedInfoPage.title.get(locale), {
                    // * thumbnail: {url: Images.avatar},
                    title,
                    description: `> ${description}`,
                    fields: [
                        {name: text.commands.help.detailedInfoPage.syntax.get(locale), value: syntax, inline: true},
                        {name: text.commands.help.detailedInfoPage.returns.get(locale), value: returns, inline: true}
                    ]
                })]
            })
        }
        commandPages.push({id: category.id, pages})
    }
    return commandPages
}