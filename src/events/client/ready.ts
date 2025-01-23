import {Event, Events} from "../types.js";
import {ActivityType} from "discord.js"
import {Images} from "../../config/index.js";

export default new Event({
    key: Events.ClientReady,
    once: true,
    callback: async ({logger}, client) => {
        logger.log(`Logged in as ${client.user.username}`);

        client.user.setPresence({
            activities: [{ name: "Use /help for more info!", type: ActivityType.Custom }],
            status: "online",
        });
        // await client.user.setBanner(Images.botBanner) TODO do it in applications?
    }
});