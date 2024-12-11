import {
    ButtonBuilder,
    ButtonComponentData,
    EmbedBuilder,
    EmbedData,
    ModalBuilder,
    StringSelectMenuBuilder
} from "discord.js";

export * from "./embed.js"

type ComponentTypes = ButtonBuilder | ModalBuilder | StringSelectMenuBuilder // TODO: Add more
type GeneratorTypes = EmbedBuilder | ComponentTypes

export type GeneratorDataMap<T extends  GeneratorTypes> =
    T extends EmbedBuilder ? EmbedData :
    T extends ButtonBuilder ? Partial<Omit<ButtonComponentData, "custom_id">>:
    never;