import {Event, Events} from "../types.js";

export default new Event({
    key: Events.ClientReady,
    once: true,
    callback: async ({logger}, client) => {
        logger.info(`Logged in as ${client.user.username}`);
    }
});