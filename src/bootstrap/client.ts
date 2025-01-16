import {Client} from "discord.js";
import {ClientIntents, ClientPartials} from "../config/index.js";
import {HooksRegistry, Symbols} from "../hooks/registry.js";
import {Keys} from "../keys/keys.js";
import {syslog} from "../utils/index.js";
import {loadEvents, events} from "../events/index.js"
import {commands, registerCommands} from "../commands/index.js";


const client = new Client({
    intents: ClientIntents,
    partials: ClientPartials,
})

HooksRegistry.set(Symbols.kClient, client);

client.login(Keys.token)
    .catch((e) => {
        syslog.error("Login", e);
        process.exit(1);
    })
    .then(async () => {
        await loadEvents(client, events)
    }).catch((e) => {
        syslog.error("Event loading", e);
        process.exit(1);
    })
    .then(async () => {
        await registerCommands(client, commands)
    }).catch((e) => {
    console.error("Command loading", e);
    process.exit(1);
})