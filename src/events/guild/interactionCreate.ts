import {Event} from "../types.js";
import {handleError} from "../../utils/index.js";

export default new Event({
    key: "interactionCreate",
    callback: async ({client, logger}, interaction) => {
        try {
            if (interaction.isCommand()) {
                const name = interaction.commandName
                //const command =
            }
        } catch (e) {
            handleError(interaction, e, logger);
        }
    }
})