import mongoose from 'mongoose';
import {HooksRegistry, Symbols } from "../hooks/registry.js"
import {Stats} from "../commands/statistics/statTypes/statTypes.js";
import {Keys} from "../keys/keys.js";
import {LoggerType, syslog} from "../utils/index.js";

const mongoUrl = Keys.mongoUrl;
export const db = await mongoose.connect(mongoUrl);
syslog.log(LoggerType.MONGODB, "Connected to database.")

export class MongoDatabase {
    public stats = new Stats();

    public constructor(public mongo: typeof db) {}
}

HooksRegistry.set(Symbols.kDatabase, new MongoDatabase(db));