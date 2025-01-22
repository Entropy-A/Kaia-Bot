import {Colors, Emojis, Images} from "../../config/index.js";
import {text} from "../../text/loadText.js";
import {
    ButtonStyle,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    LocaleString,
    SelectMenuComponentOptionData
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
    description: text.commands.help.description.get("en-US"),
    descriptionLocalizations: _.omit(text.commands.help.description.locals, "en-US"),
    type: 1
}

const callback: CommandCallback<ChatInputCommandInteraction> = async ({interaction, logger}) => {
    try {
        const mainPage_ = mainPage(interaction.locale);
        const detailedHelpPages_ = detailedHelpPages(interaction.locale);

        const selectMenu = new StringSelect({
            id: "selectCommand",
            generator: selectMenuGenerator(interaction.locale),
            callback: async ({interaction}) => {
                const newPage = menu.getPage(interaction.values[0])?.page
                if (!newPage) return handleError(interaction, new Error(`Did not find command with name: [${interaction.values[0]}] from stringSelect.`), logger)

                await menu.update(interaction, newPage)
            }
        })

        const visibilityCallback = () => {
            return !(!menu.currentPage || menu.currentPage.page.data.id === "mainPage");
        }

        const linkVisibilityCallback = () => {
            return !(!menu.currentPage || !(menu.currentPage.page.data.id === "mainPage"));
        }

        const nextButton = new Button({
            id: "nextButton",
            generator: ButtonGenerator.Next(),
            visibilityCallback,
            callback: ({interaction}) => {
                menu.defaultButtonCallbacks.absoluteNext(interaction, [0])
            }
        })

        const backButton = new Button({
            id: "backButton",
            generator: ButtonGenerator.Back(),
            visibilityCallback,
            callback: ({interaction}) => {
                menu.defaultButtonCallbacks.absoluteBack(interaction, [0])
            }
        })

        const menuButton = new Button({
            id: "menu",
            generator: ButtonGenerator.Menu(),
            visibilityCallback,
            callback: ({interaction}) => {
                menu.update(interaction, "mainPage")
            }
        })

        const website = new Button({
            id: "website",
            generator: ButtonGenerator.Link("Website", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.botWebsite),
            visibilityCallback: linkVisibilityCallback,
        })

        const invite = new Button({
            id: "invite",
            generator: ButtonGenerator.Link("Invite me!", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.invite),
            visibilityCallback: linkVisibilityCallback,
        })

        const dcServer = new Button({
            id: "dcServer",
            generator: ButtonGenerator.Link("My guild!", "https://www.youtube.com/watch?v=d43lJsK7Kvo", Emojis.dcServer),
            visibilityCallback: linkVisibilityCallback,
        })

        const menu = new PageMenu({id: "helpMenu"})
            .addCategories([mainPage_])
            .addCategories(detailedHelpPages_)
            .addGlobalComponentRows([
                [website, invite, dcServer],
                [selectMenu],
                [backButton, menuButton, nextButton],
            ])
            .addDynamicEmbedUpdates([dynamicEmbedUpdate(interaction.locale)])

        await menu.send("mainPage", interaction, undefined, true)

    } catch (e) {
        await handleError(interaction, e, logger)
    }
}

// ! Command export.
export const help = new Command({data, icon, color, detailedDescription, callback})

function selectMenuGenerator(locale: LocaleString) {
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

    return StringSelectGenerator.create({
        placeholder: text.commands.help.selectMenuPlaceholder.get(locale),
        maxValues: 1,
        options
    })
}

function dynamicEmbedUpdate(locale: LocaleString): DynamicEmbedUpdate {
    return (page, menu) => {
        const pageInfo = menu.getPage(page)
        const categoryInfo = menu.getCategoryByPage(page)
        if (!pageInfo || !categoryInfo || page.data.id === "mainPage") return page.data.embeds

        const category_ = commands.getCategory(categoryInfo.category.id)

        const emoji = category_?.emoji ?? ""
        const index = pageInfo.index + 1
        const category = categoryInfo.category
        const categoryLink = category_?.documentationLink ?? "https://www.youtube.com/watch?v=d43lJsK7Kvo"

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

function mainPage(locale: LocaleString): PageMenuCategory {
    // Menu page with bottom to fix Size.
    const menuEmbed = EmbedGenerator.Command(color, icon, text.commands.help.menu.title.get(locale), {
            description: text.commands.help.menu.description.get(locale),
            thumbnail: {url: Images.neutralAvatar},
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
        {name: "\u200B", value: text.commands.help.menu.credits.get("en-US"), inline: false}
    )

    return { id: "mainPage", pages: { "mainPage": new Page({id: "mainPage", embeds: [menuEmbed]})}}
}

function detailedHelpPages(locale: LocaleString): PageMenuCategory[] {
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
                    // * thumbnail: {url: Images.ranni_neutral_avatar},
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