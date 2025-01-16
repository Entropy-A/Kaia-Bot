import {CommandCategory} from "../types.js";
import {text} from "../../text/loadText.js"

export default new CommandCategory ({
    name: text.commands.categorys.debug.name,
    commands: [
        //ping
    ].forEach(command => {
        return co
    }),
    //emoji: Emojis.debug_icon, // TODO: Custom
    description: text.commands.categorys.debug.description,
})