import {Client} from "discord.js";
import {ClientIntents, ClientPartials} from "../config/index.js";
import {HooksRegistry, Symbols} from "../hooks/registry.js";
import {Keys} from "../keys/keys.js";
import {Logger, LoggerType} from "../utils/index.js";

const client = new Client({
    intents: ClientIntents,
    partials: ClientPartials,
})

HooksRegistry.set(Symbols.kClient, client);
const syslog = new Logger(LoggerType.SYSTEM)

client.login(Keys.token)
    .catch((e) => {
        console.error(`[Login Error] ${e}`);
        syslog.error(e);
        process.exit(1);
    }).then(() => {

    })