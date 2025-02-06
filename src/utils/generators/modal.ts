import {ActionRowBuilder, Locale, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {GeneratorDataMap} from "./index.js";

type ModalData = GeneratorDataMap<ModalBuilder>

export enum ModalID{
    newReminder     = "newReminderModal",
    newStat     = "newStatModal",
}

export class ModalGenerator extends ModalBuilder {
    public static create(data?: ModalData) {
        return new ModalBuilder(data)
    }
    //TODO: language
    // value: prefill when editing
    public static NewStat(locale: Locale, data?: ModalData) {
        return ModalGenerator.create(data)
            .setCustomId(ModalID.newStat)
            .setTitle("New Stat")
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
                    custom_id: "name",
                    label: "Name",
                    placeholder:"Give your statistic a name",
                    style: TextInputStyle.Short,
                    required: true,
                    max_length: 50,
                })),
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
                    custom_id: "description",
                    label: "Description",
                    placeholder:"Describe your statistic",
                    value: "No description.",
                    style: TextInputStyle.Short,
                    required: false,
                    max_length: 100,
                }))
            ])

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