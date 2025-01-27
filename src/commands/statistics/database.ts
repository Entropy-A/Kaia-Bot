import {LoggerType, StaticLogger} from "../../utils/log/logger.js";
import mongoose, {Types, Schema} from "mongoose";
import {Keys} from "../../keys/keys.js";

const mongoUrl = Keys.mongoUrl;

//TODO: register database

interface IStatGuild extends mongoose.Document {
    guildId: string;
    stats: Types.ObjectId[];
}

interface IStat extends mongoose.Document {
    guildId: string,
    permittedUserIds: string[],
    name: string,
    entries: IStatEntry[]
}

interface IStatEntry extends mongoose.Document {
    guildId: string,
    name: string,
    permittedUserIds: string[],
    values: [{
        value: number,
        timestamp: Date
    }]
}

const statEntrySchema = new Schema<IStatEntry>({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    permittedUserIds: [String],
    values: [{
        value: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
});
const MEntry = mongoose.model<IStatEntry>("Entry", statEntrySchema);

const statSchema = new Schema<IStat>({
    guildId: { type: String, required: true },
    permittedUserIds: [String],
    name: { type: String, required: true },
    entries: [statEntrySchema],
});
const MStat = mongoose.model<IStat>("Stat", statSchema);

const guildSchema = new Schema<IStatGuild>({
    guildId: { type: String, required: true, unique: true },
    stats: [{ type: Schema.Types.ObjectId, ref: "Stat" }],
});
const MGuild = mongoose.model<IStatGuild>('Guild', guildSchema)

// TODO: stuff when add already exists

class StatGuild {
    private readonly logger:StaticLogger

    constructor(private data: IStatGuild) {
        this.logger = new StaticLogger(LoggerType.MONGODB, `Guild: [${data.guildId}]`)
    }

    async getStat(name: string, validation: {requestUserId: string}) {
        const stat = await MStat.findOne({ guildId: this.data.guildId, name, permittedUserIds: {$in: [validation.requestUserId]}});
        if (!stat) return null
        return new Stat(stat);
    }

    async getStats(validation: { requestUserId: string }) {
        const stats_ = await MStat.find({
            guildId: this.data.guildId,
            permittedUserIds: { $in: [validation.requestUserId] }
        });
        const stats = stats_.map(stat => new Stat(stat));
        return stats.length ? stats : null;
    }

    async addStat(name: string, permittedUserIds: string[]) {
        const guildId = this.data.guildId;
        let stat = await MStat.findOne({ guildId, name});
        if (!stat) {
            stat = new MStat({ guildId, permittedUserIds, name, entries: [] });
            await stat.save();
            this.data.stats.push(stat._id as Types.ObjectId);
            await this.data.save();
            return new Stat(stat)
        } else return null;
    }

    async removeStat(name: string) {
        const guildId = this.data.guildId
        const stat = await MStat.findOne({guildId, name})
        if (!stat) return;
        stat.deleteOne()
    }
}

class Stat {
    private readonly logger: StaticLogger

    constructor(private data: IStat) {
        this.logger = new StaticLogger(LoggerType.MONGODB, `Stat: [${data.name}]`)
    }

    async getEntry(name: string, validation: {requestUserId: string}) {
        const guildId = this.data.guildId
        const entry = await MEntry.findOne({ guildId, name, permittedUserIds: {$in: [validation.requestUserId] }});
        if (!entry) return null
        return new StatEntry(entry);
    }

    async getEntries(name: string, validation: {requestUserId: string}) {
        const guildId = this.data.guildId
        const entries_ = await MEntry.find({name, guildId, permittedUserIds: {$in: [validation.requestUserId] } });
        const entries = entries_.map(entry => new StatEntry(entry));
        return entries.length ? entries : null;
    }

    async addEntry(name: string, value: number, permittedUserIds: string[]) {
        const guildId = this.data.guildId
        let entry = await MEntry.findOne({guildId, name, permittedUserIds: {$in: permittedUserIds}});
        if (!entry) {
            entry = new MEntry({ guildId, permittedUserIds, name, value });
            await entry.save();
            this.data.entries.push(entry)
            await this.data.save();
            return new StatEntry(entry)
        } else return null;
    }

    async setName(name: string) {
        this.data.name = name;
        await this.data.save()
    }

    async removeEntry(name: string) {
        const guildId = this.data.guildId
        const entry = await MEntry.findOne({guildId, name})
        if (!entry) return;
        entry.deleteOne()
    }

    async addPermittedUser(id: string) {
        this.data.permittedUserIds.push(id);
        await this.data.save()
    }

    async removePermittedUser(id: string) {
        const index = this.data.permittedUserIds.indexOf(id);
        if (index !== -1) {
            this.data.permittedUserIds.splice(index, 1);
            await this.data.save();
        }
    }
}

class StatEntry {
    constructor(private data: IStatEntry) {}

    get name(): string {
        return this.data.name
    }
    get values() {
        return this.data.values
    }
    get permittedUserIds(): string[] {
        return this.data.permittedUserIds
    }

    async addValue(value: number) {
        this.data.values.push({value, timestamp: new Date()});
        await this.data.save()
    }

    async editValue(timestamp: Date, newValue: number) {
        let value = this.data.values.find((value) => value.timestamp.toISOString() === timestamp.toISOString());
        if (!value?.value) return;
        value.value = newValue;
        await this.data.save()
    }

    async setName(name: string) {
        this.data.name = name;
        await this.data.save()
    }

    async addPermittedUser(id: string) {
        this.data.permittedUserIds.push(id);
        await this.data.save()
    }

    async removePermittedUser(id: string) {
        const index = this.data.permittedUserIds.indexOf(id);
        if (index !== -1) {
            this.data.permittedUserIds.splice(index, 1);
            await this.data.save();
        }
    }
}

class Stats {
    private readonly logger = new StaticLogger(LoggerType.MONGODB, "Stats")

    private constructor() {
    }

    static async connect () {
        await mongoose.connect(mongoUrl);
        return new Stats();
    }

    async getGuild(guildId: string) {
        const guild = await MGuild.findOne({guildId})
        if (!guild) return null
        return new StatGuild(guild)
    }

    async addGuild(guildId: string) {
        let guild = await MGuild.findOne({guildId});
        if (!guild) {
            guild = await MGuild.create({guildId});
            await guild.save();
        } else this.logger.error(`Guild: [${guildId}] was already registered for stats.`);
        return new StatGuild(guild);
    }
}