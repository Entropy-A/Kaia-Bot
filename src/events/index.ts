import ready from "./client/ready.js";
import {Event} from "./types.js";

export * from "./types.js"
export * from "./loadEvents.js"
export const events = [
    ready,
] as Event[]