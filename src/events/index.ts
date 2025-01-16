import ready from "./client/ready.js";
import interactionCreate from "./guild/interactionCreate.js";
import {Event} from "./types.js";

export * from "./types.js"
export * from "./loadEvents.js"
export const events = [
    ready,
    interactionCreate
] as Event[]