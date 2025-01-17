import { ActionRowBuilder, ModalBuilder, ModalComponentData, TextInputBuilder, TextInputStyle} from "discord.js";
import {GeneratorDataMap} from "./index.js";

type ModalData = GeneratorDataMap<ModalBuilder>

export enum ModalID{
    newReminder     = "newReminderModal",
}
// TODO: NO IDEA
export class ModalGenerator extends ModalBuilder {

    public static create(data?: ModalData) {
        return new ModalBuilder(data as ModalComponentData)
    }

    public static newReminder(data?: ModalData) {
        return ModalGenerator.create(data)
            .setCustomId(ModalID.newReminder)
            .setTitle("New Reminder")
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
                    custom_id: "name",
                    label: "Give your reminder a name.",
                    style: TextInputStyle.Short,
                    required: true,
                    max_length: 100,
                })),
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
                    custom_id: "time",
                    label: "When do you want to be reminded?",
                    style: TextInputStyle.Short,
                    required: true,
                    max_length: 100,
                }))
            ])
    }
}