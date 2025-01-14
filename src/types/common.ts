import {BaseInteraction, Client} from "discord.js";
import {StaticLogger} from "../utils/index.js";

export interface CallbackProps<Interaction extends BaseInteraction | null> {
    interaction: Interaction,
    client: Client,
    logger: StaticLogger,
}

export type Callback<ReturnType, Interaction extends BaseInteraction | null, Args extends unknown[] = unknown[]> = (
    props: CallbackProps<Interaction>,
    ...args: Args
) => ReturnType;