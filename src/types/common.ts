import {
    Awaitable,
    BaseInteraction,
    ButtonBuilder, ButtonComponentData, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction,
    Client, EmbedBuilder, EmbedData, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction,
    ModalBuilder,
    RoleSelectMenuBuilder, RoleSelectMenuInteraction,
    StringSelectMenuBuilder, StringSelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction
} from "discord.js";
import {StaticLogger} from "../utils/index.js";
import {ButtonGenerator, ComponentGenerators, StringSelectGenerator} from "../utils/generators/index.js";

export interface CallbackProps<Interaction extends BaseInteraction | null> {
    interaction: Interaction,
    client: Client,
    logger: StaticLogger,
}

export type Callback<ReturnType, Interaction extends BaseInteraction | null, Args extends unknown[] = unknown[]> = (
    props: CallbackProps<Interaction>,
    ...args: Args
) => ReturnType;

export type VisibilityCallback = Callback<boolean, BaseInteraction | null>

type InteractionGeneratorMap<ComponentGenerator extends ComponentGenerators> =
    ComponentGenerator extends ButtonGenerator ? ButtonInteraction :
    ComponentGenerator extends StringSelectGenerator ?  StringSelectMenuInteraction :
    //ComponentGenerator extends RoleSelectGenerator ?  RoleSelectMenuInteraction :
    //ComponentGenerator extends ChannelSelectGenerator ?  ChannelSelectMenuInteraction :
    //ComponentGenerator extends UserSelectGenerator ?  UserSelectMenuInteraction :
    //ComponentGenerator extends MentionableSelectGenerator ?  MentionableSelectMenuInteraction :
    never;

export interface ComponentProtoData<Generator extends ComponentGenerators> {
    id: string,
    generator: Generator,
    visibilityCallback?: VisibilityCallback,
    callback?: Callback<Awaitable<unknown>, InteractionGeneratorMap<Generator>>
}

/**
 * Abstract class for creating MessageComponents.
 * @param generic Type of componentbuilder.
 */
export abstract class ComponentPrototype<Generator extends ComponentGenerators> implements ComponentProtoData<Generator>{
    /**
     * CustomId of Component
     */
    public readonly id: string;

    /**
     * Component generator
     */
    public readonly generator: Generator;

    /**
     * Callback to check if component shall be displayed.
     */
    public readonly visibilityCallback: VisibilityCallback
    public readonly callback?: Callback<Awaitable<unknown>, InteractionGeneratorMap<Generator>>

    constructor(data: ComponentProtoData<Generator>) {
        this.id = data.id
        this.generator = data.generator
        this.visibilityCallback = data.visibilityCallback ?? (() => true )
        // ! Link-Buttons and Modals cant have custom id or callback.
        if (this.generator instanceof ModalBuilder) return
        if (this.generator instanceof ButtonBuilder && this.generator.data.style === 5) return

        this.callback = data.callback
        // ! set custom_id to id
        this.generator.setCustomId(data.id)
    }
}