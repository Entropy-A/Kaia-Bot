import {
    ActionRowBuilder,
    BaseInteraction,
    BaseMessageOptions,
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

export interface PageData {
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

class PageAnchor  {
    protected pageLogger: StaticLogger
    protected activeComponents: ComponentPrototypes[][] = []
    protected anchor?: Message | InteractionResponse

    constructor(public data: PageData) {
        this.pageLogger = new StaticLogger(LoggerType.PAGE, this.data.id) // TODO: Fix logger, in menu always the main page
        this.applyColor()
    }

    /**
     * Replies with page to interaction.
     */
    public reply(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return this.handleInteractions(interaction, AnchorHandling.send, timeout, ephemeral)
    }

    /**
     * Follows up with page to interaction.
     */
    public followUp(interaction: BaseInteraction, timeout?: number, ephemeral?: boolean) {
        return this.handleInteractions(interaction, AnchorHandling.followUp, timeout, ephemeral)
    }

    /**
     * Updates page to a new page.
     */
    public update(interaction: BaseInteraction, newPage?: PageAnchor) {
        this.data = newPage?.data ?? this.data
        this.pageLogger = new StaticLogger(LoggerType.PAGE, this.data.id)
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
        const replyPayload = (): BaseMessageOptions | InteractionReplyOptions => {
            return {
                embeds: this.createEmbedArray(),
                components: this.createActionRows(interaction),
                ephemeral
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
                if (!interaction.isRepliable()) break
                if (interaction.replied) this.setCollector(await interaction.editReply(updatePayload()), interaction, timeout)
                else this.setCollector(await interaction.reply(replyPayload()), interaction, timeout)
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
                    this.anchor?.edit(updatePayload()) // ! Not tested
                }
                break;

            default: throw new Error("Page-anchor chant answer interaction")
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

    private handleComponentInteraction(interaction: MessageComponentInteraction) {
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