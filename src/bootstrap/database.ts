import mongoose from 'mongoose';
import {HooksRegistry, Symbols } from "../hooks/registry.js"
import {Keys} from "../keys/keys.js";
import {LoggerType, syslog} from "../utils/index.js";
import {MongoDB} from "../Database/database.js";

const mongoUrl = Keys.mongoUrl;
export const db = await mongoose.connect(mongoUrl);
HooksRegistry.set(Symbols.kDatabase, new MongoDB(db));

syslog.log(LoggerType.MONGODB, "Connected to database.")