import { HooksRegistry, Symbols } from './registry.js';
import { MongoDatabase } from '../bootstrap/database.js';

export function useDatabase() {
    const mongoose = HooksRegistry.get(Symbols.kDatabase) as | MongoDatabase | undefined;

    if (!mongoose) {
        throw new Error('Mongoose has not been initialized');
    }

    return mongoose;
}