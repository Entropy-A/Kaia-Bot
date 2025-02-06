import { HooksRegistry, Symbols } from './registry.js';
import {MongoDB} from "../Database/index.js";

export function useDatabase() {
    const mongoose = HooksRegistry.get(Symbols.kDatabase) as | MongoDB| undefined;

    if (!mongoose) {
        throw new Error('Mongoose has not been initialized');
    }

    return mongoose;
}