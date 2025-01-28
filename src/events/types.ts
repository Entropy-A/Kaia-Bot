import {ClientEvents, Awaitable} from "discord.js";
import {BaseCallback} from "../types/common.js";

export {Events} from "discord.js"
export type EventKeys = keyof ClientEvents;

export type EventCallback<K extends EventKeys> = BaseCallback<Awaitable<unknown>, null, ClientEvents[K]>
export interface EventData<K extends EventKeys> {
    key: K,
    callback: EventCallback<K>,
    once?: boolean
}

/**
 * Class for event handling.
 */
export class Event<K extends EventKeys = EventKeys> implements EventData<K> {
    public readonly key
    public readonly callback
    public readonly once

    /**
     * @param data.key Key: Events.[...]
     */
    constructor(data: EventData<K>) {
        this.key = data.key;
        this.callback = data.callback;
        this.once = data.once ?? false;
    }
}