export enum LoggerType {
    SYSTEM = "SYSTEM",
    COMMAND = "COMMAND",
    EVENT = "EVENT",
    PAGE = "PAGE"
}

/**
 * Custom logger to bind log to some origin.
 * @param LoggerData - { type: LoggerType, origin: string }
 */
export class Logger  {
    constructor(
        public readonly type: LoggerType,
        public readonly origin?: string)
    {} // TODO: What if origin is not knows before class is inizialised. Like in system when login error

    // Only shows origin in message when defined.
    public log(...message: unknown[]) {
        console.log(`[Log] [${this.type}${this.origin ? `: ${this.origin}` : ""}] >> ${message}`)
    }

    public info(...message: unknown[]) {
        console.info(`[Info] [${this.type}${this.origin ? `: ${this.origin}` : ""}] >> ${message}`)
    }

    public warn(...message: unknown[]) {
        console.warn(`[Warn] [${this.type}${this.origin ? `: ${this.origin}` : ""}] >> ${message}`)
    }

    public error(...message: unknown[]) {
        console.error(`[Error] [${this.type}${this.origin ? `: ${this.origin}` : ""}] >> ${message}`)
    }
}