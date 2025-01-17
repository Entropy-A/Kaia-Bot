import {
    ButtonBuilder,
    ButtonComponentData, ButtonInteraction, ChannelSelectMenuBuilder,
    EmbedBuilder,
    EmbedData, MentionableSelectMenuBuilder,
    ModalBuilder, RoleSelectMenuBuilder,
    StringSelectMenuBuilder, StringSelectMenuInteraction, UserSelectMenuBuilder
} from "discord.js";
import {ButtonGenerator} from "./button.js";
import {ModalGenerator} from "./modal.js";
import {StringSelectGenerator} from "./stringSelect.js";

export * from "./embed.js"
export * from "./button.js"
export * from "./stringSelect.js"
export * from "./modal.js"

type ComponentTypes = ButtonBuilder | ModalBuilder | StringSelectMenuBuilder // TODO: Add more
type GeneratorTypes = EmbedBuilder | ComponentTypes

export type GeneratorDataMap<T extends GeneratorTypes> =
    T extends EmbedBuilder ? EmbedData :
    T extends ButtonBuilder ? Partial<Omit<ButtonComponentData, "custom_id">>:
    T extends ModalBuilder ? Omit<ConstructorParameters<typeof ModalBuilder>[0], "custom_id"> :
    T extends StringSelectMenuBuilder ? Omit<ConstructorParameters<typeof StringSelectMenuBuilder>[0], "custom_id"> :
    never;

export type ComponentGenerators = ButtonGenerator | ModalGenerator | StringSelectGenerator // TODO: MORE GENERATORS

export type InteractionGeneratorMap<ComponentGenerator extends ComponentGenerators> =
    ComponentGenerator extends ButtonGenerator ? ButtonInteraction :
        ComponentGenerator extends StringSelectGenerator ?  StringSelectMenuInteraction :
            //ComponentGenerator extends RoleSelectGenerator ?  RoleSelectMenuInteraction :
            //ComponentGenerator extends ChannelSelectGenerator ?  ChannelSelectMenuInteraction :
            //ComponentGenerator extends UserSelectGenerator ?  UserSelectMenuInteraction :
            //ComponentGenerator extends MentionableSelectGenerator ?  MentionableSelectMenuInteraction :
            never;