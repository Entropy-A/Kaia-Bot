import {Client} from "discord.js";
import {ClientIntents, ClientPartials} from "../config/index.js";
import {HooksRegistry, Symbols} from "../hooks/registry.js";
import {Keys} from "../keys/keys.js";
import {DynamicLogger, LoggerType} from "../utils/index.js";

const client = new Client({
    intents: ClientIntents,
    partials: ClientPartials,
})

HooksRegistry.set(Symbols.kClient, client);
// TODO: maybe somewere else
const syslog = new DynamicLogger(LoggerType.SYSTEM)

client.login(Keys.token)
    .catch((e) => {
        syslog.error("Login Error", e);
        process.exit(1);
    }).then(() => {

    })