import {Client} from "discord.js";
import {LoggerType, StaticLogger} from "../utils/index.js";
import {Event} from "./types.js";

enum method {
    on = "on",
    once = "once",
}
export async function loadEvents (client: Client, events: Event[]) {
    const registerEvent = (event: Event, method: method) => {
        const logger = new StaticLogger(LoggerType.EVENT, event.key);
        client[method](event.key, (...args) => {
            try {
                event.callback({ interaction: null, logger, client }, ...args);
            } catch (e) {
                logger.error(e);
            }
        });
    };

    for (const event of events) {
        registerEvent(event, event.once ? method.once : method.on);
    }
}