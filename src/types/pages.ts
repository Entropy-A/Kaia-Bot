import {
    ActionRowBuilder,
    BaseInteraction,
    BaseMessageOptions, Collection,
    Interaction,
    InteractionReplyOptions,
    InteractionResponse,
    InteractionUpdateOptions,
    Message,
    MessageActionRowComponentBuilder,
    MessageComponentInteraction,
    MessageEditOptions,
    MessageFlags
} from "discord.js";
import {EmbedGenerator, LoggerType, StaticLogger} from "../utils/index.js";
import {Button, CallbackProps, ComponentPrototypes, StringSelect} from "./index.js";
import {useClient} from "../hooks/useClient.js";
import {Colors} from "../config/index.js";

enum AnchorHandling {
    send,
    followUp,
    update,
}

export interface PageData{
    readonly id: string,
    color?: Colors,
    embeds?: readonly [
        EmbedGenerator?, EmbedGenerator?, EmbedGenerator?, EmbedGenerator?, EmbedGenerator?,
        EmbedGenerator?, EmbedGenerator?, EmbedGenerator?, EmbedGenerator?, EmbedGenerator?,
    ],
    components?: readonly [
        [ ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes? ]?,
        [ ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes? ]?,
        [ ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes? ]?,
        [ ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes? ]?,
        [ ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes?, ComponentPrototypes? ]?
    ] // TODO: Find better way --> components.ts
}

export class Page {
    constructor(protected _data: PageData) {}

    get data(): PageData {
        return this._data
    }
    /**
     * Adds embeds to page.
     */
    public addEmbeds(embeds: PageData["embeds"]): this {
        const newEmbeds = [...this._data.embeds ?? [], ...embeds ?? []];
        if (newEmbeds.length > 10) throw new Error(`To many embeds on page: ${this._data.id}`);
        else this._data.embeds = newEmbeds.length > 0 ? newEmbeds as unknown as PageData["embeds"] : undefined; // ? Currently no better way to work around "source may have more elements error".
        return this
    }

    /**
     * Adds components to page.
     */
    public addComponentRows(components: PageData["components"]): this {
        const newComponents = [...this._data.components ?? [], ...components ?? []]
        if (newComponents.length > 5) throw new Error(`To many component rows on page: ${this._data.id}`)
        else this._data.components = newComponents.length > 0 ? newComponents as unknown as PageData["components"] : undefined; // ? Currently no better way to work around "source may have more elements error".
        return this
    }

    /**
     * Replies with page to interaction.
     * @param interaction
     * @param timeout How long the page is visible.
     * @param ephemeral If only the author can see it.
     */
    public send(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return new PageAnchor(this._data).send(interaction, timeout, ephemeral)
    }

    /**
     * Follows up with page to interaction.
     * @param interaction
     * @param timeout How long the page is visible.
     * @param ephemeral If only the author can see it.
     */
    public sendFollowUp(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return new PageAnchor(this._data).sendFollowUp(interaction, timeout, ephemeral)
    }
}

class PageAnchor {
    protected pageLogger: StaticLogger
    protected activeComponents: ComponentPrototypes[][] = []
    protected anchor?: Message | InteractionResponse

    constructor(public data: PageData) {
        this.pageLogger = new StaticLogger(LoggerType.PAGE, this.data.id) // TODO: Fix logger, in menu maybe always the main page??
        this.applyColor()
    }

    /**
     * Replies with page to interaction.
     */
    public send(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return this.handleInteractions(interaction, AnchorHandling.send, timeout, ephemeral)
    }

    /**
     * Follows up with page to interaction.
     */
    public sendFollowUp(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return this.handleInteractions(interaction, AnchorHandling.followUp, timeout, ephemeral)
    }

    /**
     * Updates page to a new page.
     */
    public update(interaction: BaseInteraction, newPage?: Page) {
        this.data = newPage?.data ?? this.data
        this.pageLogger = new StaticLogger(LoggerType.PAGE, this.data.id)
        this.applyColor()
        return this.handleInteractions(interaction, AnchorHandling.update)
    }

    /**
     * Deletes page.
     */
    public delete() {
        this.anchor?.delete()
    }

    protected async handleInteractions(interaction: BaseInteraction, methode: AnchorHandling, timeout?: number, ephemeral?: boolean) {
        // * Sending Page.
        const flags = ephemeral ? "Ephemeral": undefined
        const replyPayload = (): BaseMessageOptions | InteractionReplyOptions => {
            return {
                embeds: this.createEmbedArray(),
                components: this.createActionRows(interaction),
                flags
            }
        }

        // * Update Page.
        const updatePayload = (): MessageEditOptions | InteractionUpdateOptions => {
            return {
                embeds: this.createEmbedArray(),
                components: this.createActionRows(interaction)
            }
        }

        switch (methode) {
            case AnchorHandling.send:
                try {
                    if (!interaction.isRepliable()) break
                    if (interaction.replied) this.setCollector(await interaction.editReply(updatePayload()), interaction, timeout)
                    else this.setCollector(await interaction.reply(replyPayload()), interaction, timeout)
                } catch {
                    this.pageLogger.info("Force update Page. Maybe fix required.")
                    this.anchor?.edit(updatePayload()) // ! Not tested
                }
                break;

            case AnchorHandling.followUp:
                if (!interaction.isRepliable()) break
                this.setCollector(await interaction.followUp(replyPayload()), interaction, timeout)
                break;

            case AnchorHandling.update:
                try {
                    if (interaction.isMessageComponent()) await interaction.update(updatePayload())
                    else if (interaction.isRepliable()) await interaction.editReply(updatePayload())
                } catch {
                    this.pageLogger.info("Force update Page. Maybe fix required.")
                    this.anchor?.edit(updatePayload()) // ! Not tested
                }
                break;

            default: throw new Error("Page-anchor cant answer interaction")
        }
        return this
    }

    protected setCollector(anchor: Message | InteractionResponse, interaction: BaseInteraction, timeout?: number) {
        this.anchor = anchor;
        const filter = (i: Interaction) => i.user.id === interaction.user.id;
        const componentCollector = anchor.createMessageComponentCollector({ filter, time: timeout });

        componentCollector.on("collect", (interaction) => {
            componentCollector.resetTimer();
            this.handleComponentInteraction(interaction);
        });
        componentCollector.on("end", async () => {
            if (anchor instanceof Message && anchor.flags.has(MessageFlags.Ephemeral)) return
            else await anchor.delete()
        })
        return this
        }

    protected handleComponentInteraction(interaction: MessageComponentInteraction) {
        // ! Currently working. If any error occurs: Use else if chain.
        const callbackParams: CallbackProps<any> = {interaction, client: useClient(), logger: this.pageLogger};
        for (const component of this.activeComponents.flat()) {
            if (component.callback && interaction.customId === component.id) {
                switch (true) {
                    case component instanceof Button && interaction.isButton():
                        component.callback(callbackParams);
                        break;
                    case component instanceof StringSelect && interaction.isStringSelectMenu():
                        component.callback(callbackParams);
                        break;
                }
            }
        }
    }

    protected setActiveComponents(interaction: BaseInteraction) {
        if (!this.data.components) return undefined
        this.activeComponents = []
        this.data.components.forEach((row) => {
            this.activeComponents.push([]);
            row?.forEach( component => {
                if (component?.visibilityCallback({interaction, client: useClient(), logger: this.pageLogger})) {
                    this.activeComponents[this.activeComponents.length - 1].push(component)
                }
            })
            // * Removes empty rows (Ex.: If the whole row is not shown yet.)
            if (this.activeComponents[this.activeComponents.length - 1].length <= 0) this.activeComponents.pop()
        })

        // * Check if there is any componentRow longer than 0
        if (this.activeComponents.length === 0) return undefined
    }

    protected createActionRows(interaction: BaseInteraction): ActionRowBuilder<MessageActionRowComponentBuilder>[] | undefined {
        if (!this.data.components) return undefined
        this.setActiveComponents(interaction)
        return this.activeComponents.map(row => {
            const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            for (const component of row) {
                actionRow.addComponents(component.generator)
            }
            return actionRow
        })
    }

    // * Remove undefined.
    protected createEmbedArray(): EmbedGenerator[] | undefined{
        if (!this.data.embeds) return undefined
        const embedArray: EmbedGenerator[] = []
        this.data.embeds.forEach( embed => {
            if (embed) embedArray.push(embed)
        })
        return embedArray
    }

    protected applyColor(): this {
        if (!this.data.color || !this.data.embeds) return this
        this.data.embeds.map( embed => {
            if (embed) embed.data.color = this.data.color
        })
        return this
    }
}

export interface PageMenuData {
    readonly id: string,
    categories?: Record<string, PageMenuCategory>
}

export interface PageMenuCategory {
    readonly id: string
    pages: Record<string, Page>
}

export type DynamicEmbedUpdate = ((
    page: Page,
    menu: PageMenu
) => PageData["embeds"])

export class PageMenu {
    protected anchor?: PageAnchor
    protected dynamicEmbedUpdates?: DynamicEmbedUpdate[]

    public currentCategory?: {
        category: PageMenuCategory
        index: number
    }
    public currentPage?: {
        page: Page,
        index: number,
    }

    constructor(protected data: PageMenuData) {}
    /**
     * Adds pages to category (auto creates new category).
     */
    public addPages(pages: Page[], category: string): this {
        if (!this.data.categories) this.data.categories = {}
        if (!this.data.categories[category]) this.data.categories[category] = {id: category, pages: {}}

        for (const page of pages) {
            if (this.data.categories[category].pages[page.data.id]) {
                throw new Error(`Page with id: [${page.data.id}] already exists in category: [${category}] of pageMenu: [${this.data.id}].`);
            }
            this.data.categories[category].pages[page.data.id] = page;
        }
        return this;
    }

    /**
     * Add a set of categories.
     */
    public addCategories(categories: PageMenuCategory[]): this {
        if (!this.data.categories) this.data.categories = {}

        for (const category of categories) {
            this.data.categories[category.id] = category
        }
        return this
    }

    /**
     * Add components to all existing pages.
     */
    public addGlobalComponentRows(components: PageData["components"]): this {
        if (!this.data.categories) return this
        Object.values(this.data.categories).forEach(({pages}) => {
            Object.values(pages).forEach((page) => {
                page.addComponentRows(components);
            });
        });

        return this
    }

    /**
     * Add callbacks that may modify all existing embeds.
     */
    public addDynamicEmbedUpdates(callbacks: DynamicEmbedUpdate[]): this {
        if(!this.dynamicEmbedUpdates) this.dynamicEmbedUpdates = []
        this.dynamicEmbedUpdates = [...this.dynamicEmbedUpdates, ...callbacks]

        return this
    }

    /**
     * Get page and corresponding data by page.
     */
    public getCategoryByPage(key: string | Page): {category: PageMenuCategory, index: number } | undefined {
        if (!this.data.categories) return undefined

        for (const [index, category] of Object.values(this.data.categories).entries()) {
            if (typeof key === "string" && category.pages[key] || key instanceof Page &&  Object.values(category.pages).includes(key)) return {index, category}
        }
        return undefined
    }

    /**
     * Get page and corresponding data by id or page.
     */
    public getPage(key: string | Page): {page: Page, index: number } | undefined {
        if (!this.data.categories) return undefined

        for (const pages of Object.values(this.data.categories).map(({pages}) => {return Object.values(pages)})) {
            for (const [index, page] of pages.entries()) {
                if (typeof key === "string" && page.data.id === key || key instanceof Page &&  page === key) return {index, page}
            }
        }

        /*for (const [index, page] of Object.values(this.data.categories).map(({pages}) => {return Object.values(pages)}).entries()) {
            if (typeof key === "string" && page.data.id === key || key instanceof Page &&  page === key) return {index, page}
        }*/
        return undefined
    }

    /**
     * Get page and corresponding data by id or category.
     */
    public getCategory(key: string | PageMenuCategory): {category: PageMenuCategory, index: number } | undefined {
        if (!this.data.categories) return undefined

        for (const [index, category] of Object.values(this.data.categories).entries()) {
            if (typeof key === "string" && category.id === key || Object.values(category).includes(key)) return {index, category}
        }
        return undefined
    }

    /**
     * Replies with page to interaction.
     * @param timeout How long the page is visible.
     * @param ephemeral If only the author can see it.
     */
    public async send(page: string | Page, interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        await this.setAnchor(page).send(interaction, timeout, ephemeral)
    }

    /**
     * Follows up with page to interaction.
     * @param timeout How long the page is visible.
     * @param ephemeral If only the author can see it.
     */
    public async followUp(page: string | Page, interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        await this.setAnchor(page).sendFollowUp(interaction, timeout, ephemeral)
    }

    /**
     * Updates page to a new page.
     */
    public async update(interaction: BaseInteraction, newPage: string | Page) {
        if (!this.anchor) throw new Error(`The page on pageMenu: [${this.data.id}] can't be updated before it was send.`)
        await this.setAnchor(newPage).update(interaction)
    }

    protected setAnchor(page: string | Page): PageAnchor {
        const foundPage = this.getPage(page)
        const foundCategory = this.getCategoryByPage(page)
        if(!foundPage) throw new Error(`Cannot find page with id: [${typeof page === "string" ? page : page.data.id}] in pageMenu: [${this.data.id}].]`)
        if(!foundPage) throw new Error(`Cannot find category with member: [${typeof page === "string" ? page : page.data.id}] in pageMenu: [${this.data.id}].]`)
        this.currentPage = foundPage
        this.currentCategory = foundCategory

        // Initialize new anchor.
        if (!this.anchor) this.anchor = new PageAnchor(this.applyDynamicPageUpdates(foundPage.page).data)
        else this.anchor.data = this.applyDynamicPageUpdates(foundPage.page).data

        return this.anchor
    }

    protected applyDynamicPageUpdates(page: Page): Page {
        if(!this.dynamicEmbedUpdates) return page
        const updatedPage = new Page(page.data)

        // * Apply every callback on embed.
        for (const callback of this.dynamicEmbedUpdates) {
            updatedPage.data.embeds = callback(page, this)
        }
        return updatedPage
    }

    // Utils:
    defaultButtonCallbacks = {
        /**
         * Jumps to next page in category.
         */
        nextInCategory: async (interaction: BaseInteraction) => {
            if (!this.currentPage || !this.currentCategory) throw new Error(`No anchor was initialized on a this pageMenu: [${this.data.id}].`)

            let nextIndex = this.currentPage.index + 1
            if (nextIndex >= Object.values(this.currentCategory.category.pages).length) nextIndex = 0

            const nextPage = Object.values(this.currentCategory.category.pages)[nextIndex]
            await this.update(interaction, nextPage)
        },

        /**
         * Jumps to next page in category and skips to next category if at the end of the current category.
         * @param skipCategory Index or id of category that are skipped.
         */
        absoluteNext: async (interaction: BaseInteraction, skipCategory?: number[]) => {
            if (!this.currentPage || !this.currentCategory || !this.data.categories) {
                throw new Error(`No anchor initialized in PageMenu: [${this.data.id}].`);
            }

            const categories = Object.values(this.data.categories);
            let nextCategoryIndex = this.currentCategory.index;
            let nextPageIndex = this.currentPage.index + 1;

            if (nextPageIndex >= Object.values(categories[nextCategoryIndex].pages).length) {
                nextPageIndex = 0;
                nextCategoryIndex = (nextCategoryIndex + 1) % categories.length;
            }

            // Skip invalid categories/pages
            while (skipCategory?.includes(nextCategoryIndex)) {
                nextCategoryIndex = (nextCategoryIndex + 1) % categories.length;
            }

            const nextPage = Object.values(categories[nextCategoryIndex].pages)[nextPageIndex];
            await this.update(interaction, nextPage);
        },

        /**
         * Jumps to last page in category.
         */
        backPageInCategory: async (interaction: BaseInteraction) => {
            if (!this.currentPage || !this.currentCategory) throw new Error(`No anchor was initialized on a this pageMenu: [${this.data.id}].`)

            let nextIndex = this.currentPage.index - 1
            if (nextIndex < 0) nextIndex = Object.values(this.currentCategory.category.pages).length - 1

            const nextPage = Object.values(this.currentCategory.category.pages)[nextIndex]
            await this.update(interaction, nextPage)
        },


        /**
         * Jumps to last page in category and skips to previous category if at the end of the current category.
         * @param skipCategory Index or id of category that are skipped.
         */
        absoluteBack: async (interaction: BaseInteraction, skipCategory?: number[]) => {
            if (!this.currentPage || !this.currentCategory || !this.data.categories) throw new Error(`No anchor was initialized on a this pageMenu: [${this.data.id}].`)

            const categories = Object.values(this.data.categories);
            let nextCategoryIndex = this.currentCategory.index;
            let nextPageIndex = this.currentPage.index - 1;

            if (nextPageIndex < 0) {
                nextPageIndex = Object.values(categories[nextCategoryIndex].pages).length - 1;
                nextCategoryIndex = (nextCategoryIndex - 1) < 0 ? categories.length - 1 : nextCategoryIndex - 1;
            }

            // Skip invalid categories/pages
            while (skipCategory?.includes(nextCategoryIndex)) {
                nextCategoryIndex = (nextCategoryIndex - 1) < 0 ? categories.length - 1 : nextCategoryIndex - 1;
            }

            const nextPage = Object.values(categories[nextCategoryIndex].pages)[nextPageIndex];
            await this.update(interaction, nextPage);
        },
    }
}
