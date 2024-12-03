import {GatewayIntentBits, Partials} from "discord.js";

export const ClientIntents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
]

export const ClientPartials = [
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.ThreadMember,
]

export enum t {
    s = 1000,
    min = 60 * s,
    h = 60 * min
}