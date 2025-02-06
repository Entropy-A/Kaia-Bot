import {db} from "../bootstrap/database.js";
import {DynamicLogger, LoggerType, StaticLogger} from "../utils/index.js";
import {IGuild, IStat, IUser, MGuild, MStat, MUser} from "./schemas/index.js";
import {Stat} from "./types/index.js";
import {Types} from "mongoose";

export class MongoDB {
    private readonly logger = new DynamicLogger(LoggerType.MONGODB)
    public constructor(public mongo: typeof db) {}

    static async getUser(alias: string) {
        let user = await MUser.findOne({aliases: {$in: [alias]} });
        if (!user) {
            user = await MUser.create({ aliases: [alias] });
        }
        return user._id;
    }

    static async getUsers(aliases: string[]) {
        const existingUsers = await MUser.find({ aliases: { $in: aliases } });
        const existingUserIds = new Set(existingUsers.map(user => user._id));

        const newAliases = aliases.filter(alias =>
            !existingUsers.some(user => user.aliases.includes(alias))
        );

        if (!newAliases.length) return [...existingUserIds];

        const newUsers = await MUser.insertMany(newAliases.map(alias => ({ aliases: [alias] })));
        const newUsersIds = newUsers.map(user => user._id);

        return [...existingUserIds, ...newUsersIds];
    }

    static async populateUser(ids: Types.ObjectId[]) {
        return MUser.find({_id: {$in: ids}}).exec();
    }

    public async getGuild(guildId: string) {
        const guild = await MGuild.findOne({guildId})
        if (!guild) return null
        return new DbGuild(guild)
    }

    public async addGuild(guildId: string) {
        let guild = await MGuild.findOne({guildId});
        if (!guild) {
            guild = await MGuild.create({guildId});
            await guild.save();
        } else this.logger.info(`Guild: [${guildId}]`, "Guild was already registered.");
        return new DbGuild(guild);
    }
}

export class DbGuild {
    private readonly logger: StaticLogger

    constructor(private data: IGuild) {
        this.logger = new StaticLogger(LoggerType.MONGODB, `Guild: [${data.guildId}]`)
    }

    async getStat(name: string, validation: {requestUserId: string}) {
        const user = await MongoDB.getUser(validation.requestUserId)

        const stat = await MStat.findOne({_id: {$in: this.data.stats}, name, $or: [{permittedUsers: user._id}, {owner: user._id}] });
        if (!stat) return null

        return new Stat(stat);
    }

    async getAllStats(validation: { requestUserId: string }) {
        const user = await MongoDB.getUser(validation.requestUserId)

        const stats_ = await MStat.find({_id: {$in: this.data.stats}, $or: [{permittedUsers: user._id}, {owner: user._id}] });
        const stats = stats_.map(stat => new Stat(stat));
        return stats.length ? stats : null;
    }

    async getMyStats(validation: { requestUserId: string }) {
        const user = await MongoDB.getUser(validation.requestUserId)

        let stats_ = await MStat.find({_id: {$in: this.data.stats}, owner: user._id });
        const stats = stats_.map(stat => new Stat(stat));
        return stats.length ? stats : null;
    }

    async addStat(stat: IStat) {
        if (!await this.statAlreadyExists(stat.name)) {
            const stat_ = await MStat.create(stat);
            this.data.stats.push(stat_._id);
            await this.data.save();
            return new Stat(stat_)
        } else return null;
    }

    async statAlreadyExists(name: string) {
        return !!MStat.findOne({ _id: {$in: this.data.stats}, name});
    }

    async removeStat(name: string, validation: { requestUserId: string }) {
        const user = await MongoDB.getUser(validation.requestUserId)
        const stat = await MStat.deleteOne({_id: {$in: this.data.stats}, name, owner: user._id})
    }
}