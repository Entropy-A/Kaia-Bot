import {Client} from "discord.js";
import {ClientIntents, ClientPartials} from "../config/index.js";
import {HooksRegistry, Symbols} from "../hooks/registry.js";
import {Keys} from "../keys/keys.js";
import {syslog} from "../utils/index.js";
import {loadEvents, events} from "../events/index.js"


const client = new Client({
    intents: ClientIntents,
    partials: ClientPartials,
})

HooksRegistry.set(Symbols.kClient, client);

client.login(Keys.token)
    .catch((e) => {
        syslog.error("Login Error", e);
        process.exit(1);
    }).then(async () => {
        await loadEvents(client, events)
    }).catch((e) => {
        syslog.error("Event Loading", e);
        process.exit(1);
})