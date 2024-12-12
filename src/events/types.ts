import {ClientEvents, Awaitable} from "discord.js";
import {StaticLogger} from "../utils/index.js";
import {Callback} from "../types/common.js";

export {Events} from "discord.js"
export type EventKeys = keyof ClientEvents;

export type EventCallback<K extends EventKeys> = Callback<Awaitable<unknown>, null, ClientEvents[K]>
export interface EventData<K extends EventKeys> {
    key: K,
    callback: EventCallback<K>,
    once?: boolean
}

/**
 * @param {EventKeys} eventKey
 * @param {EventCallback} callback
 * @param {Boolean} once (optional) default: false
 */
export class Event<K extends EventKeys = EventKeys> implements EventData<K> {
    public readonly key: K
    public readonly callback: EventCallback<K>
    public readonly once?: boolean = false

    constructor(data: EventData<K>) {
        this.key = data.key;
        this.callback = data.callback;
        this.once = data.once;
    }
}