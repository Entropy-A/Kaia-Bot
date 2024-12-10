export enum LoggerType {
    SYSTEM = "SYSTEM",
    COMMAND = "COMMAND",
    EVENT = "EVENT",
    PAGE = "PAGE"
}

/**
 * Custom logger to bind log to some "origin" that is UNKNOWN beforehand.
 */
export class DynamicLogger  {
    constructor(
        public readonly type: LoggerType)
    {}

    public log(origin: string | null, ...message: unknown[]) {
        console.log(`[Log] [${this.type}${origin ? `: ${origin}` : ""}] >> ${message}`)
    }

    public info(origin: string | null, ...message: unknown[]) {
        console.info(`[Info] [${this.type}${origin ? `: ${origin}` : ""}] >> ${message}`)
    }

    public warn(origin: string | null, ...message: unknown[]) {
        console.warn(`[Warn] [${this.type}${origin ? `: ${origin}` : ""}] >> ${message}`)
    }

    public error(origin: string | null, ...message: unknown[]) {
        console.error(`[Error] [${this.type}${origin ? `: ${origin}` : ""}] >> ${message}`)
    }
}

/**
 * Custom logger to bind log to some "origin" that is FIXED.
 */
export class StaticLogger extends DynamicLogger {
    constructor(type: LoggerType,
        public readonly origin: string | null = null)
    {super(type)};

    public log(...message: unknown[]) {
        super.log(this.origin, ...message)
    }

    public info(...message: unknown[]) {
        super.info(this.origin, ...message)
    }

    public warn(...message: unknown[]) {
        super.warn(this.origin, ...message)
    }

    public error(...message: unknown[]) {
        super.error(this.origin, ...message)
    }
}