export const HooksRegistry = new Map<symbol, unknown>();
export const Symbols = {
    kClient: Symbol('Client'),
    kRedis: Symbol('Redis'), // Use in future no idea what it is
    kDatabase: Symbol('Database'),
} as const;