import {LoggerType, StaticLogger} from "../../utils/index.js";
import {IStat, IStatEntry, IStatEntryValue, MEntry, MUser, MValue} from "../schemas/index.js";
import {MongoDB} from "../database.js";
import {Types} from "mongoose";

export class Stat {
    private readonly logger: StaticLogger

    constructor(private data: IStat) {
        this.logger = new StaticLogger(LoggerType.MONGODB, `Stat: [${data.name}]`)
    }

    get name() {
        return this.data.name
    }

    get description() {
        return this.data.description
    }

    get permittedUsers() {
        return this.data.permittedUsers
    }

    /**
     * Get entry user has access on.
     */
    async getEntry(name: string, validation: {requestUserId: string}) {
        const user = await MongoDB.getUser(validation.requestUserId)
        const entry = await MEntry.findOne({ name, $or: [{permittedUsers: {$in: [user._id]}}, {owner: user._id}] , _id: {$in: this.data.entries} });
        if (!entry) return null
        return new StatEntry(entry);
    }

    /**
     * Get all entries user has access on.
     */
    async getAllEntries(validation: {requestUserId: string}) {
        const user = await MongoDB.getUser(validation.requestUserId)
        const entries_ = await MEntry.find({ $or: [{permittedUsers: {$in: [user._id]}}, {owner: user._id}], _id: {$in: this.data.entries} });
        const entries = entries_.map(entry => new StatEntry(entry));
        return entries.length ? entries : null;
    }

    /**
     * Get all entry user is owner on.
     */
    async getMyEntries(validation: {requestUserId: string}) {
        const user = await MongoDB.getUser(validation.requestUserId)
        const entries_ = await MEntry.find({ owner: {$in: [user._id], _id: {$in: this.data.entries} } });
        const entries = entries_.map(entry => new StatEntry(entry));
        return entries.length ? entries : null;
    }

    async addEntry(name: string, description: string, value: IStatEntryValue, ownerId: string, permittedUserIds?: string[]) {
        const users = await MUser.find({ aliases: {$in: permittedUserIds}});
        const permittedUsers = users.map(user => user._id)
        const owner = await MongoDB.getUser(ownerId)
        let entry = await MEntry.findOne({name, _id: {$in: this.data.entries}});
        if (!entry) {
            entry = await MEntry.create({ owner: owner._id, permittedUsers, name, description, value });
            this.data.entries.push(entry._id)
            await this.data.save();
            return new StatEntry(entry)
        } else return null;
    }

    async setName(name: string) {
        this.data.name = name;
        await this.data.save()
    }

    async setDescription(description: string) {
        this.data.description = description;
        await this.data.save()
    }

    async removeEntry(name: string, validation: {requestUserId: string}) {
        const user = await MongoDB.getUser(validation.requestUserId)
        const entry = await MEntry.deleteOne({name, owner: user._id, _id: {$in: this.data.entries}});
    }

    async addPermittedUsers(id: string[]) {
        const users = await MongoDB.getUsers(id)
        this.data.permittedUsers = [...this.data.permittedUsers, ...users.map(user => user._id)];
        await this.data.save()
    }

    async removePermittedUsers(id: string[]) {
        const users = await MongoDB.getUsers(id)
        for (const user of users) {
            await this.data.updateOne({ $pull: {permittedUsers: user._id} });
        }
    }
}

export class StatEntry {
    constructor(private data: IStatEntry) {}

    get name() {
        return this.data.name
    }

    get description() {
        return this.data.description
    }

    get values() {
        return this.data.values
    }

    get permittedUsers() {
        return this.data.permittedUsers
    }

    async addValue(value: number, notes: string) {
        this.data.values.push(await MValue.create({value, notes, timestamp: new Date()}));
        await this.data.save()
    }

    async editValue(timestamp: Date, newValue: number) {
        let value = this.data.values.find((value) => value.timestamp.toISOString() === timestamp.toISOString());
        if (!value) return;
        else value.value = newValue;
        await this.data.save()
    }

    async setName(name: string) {
        this.data.name = name;
        await this.data.save()
    }

    async addPermittedUsers(id: string[]) {
        const users = await MongoDB.getUsers(id)
        this.data.permittedUsers = [...this.data.permittedUsers, ...users.map(user => user._id)];
        await this.data.save()
    }

    async removePermittedUsers(id: string[]) {
        const users = await MongoDB.getUsers(id)
        for (const user of users) {
            await this.data.updateOne({ $pull: {permittedUsers: user._id} });
        }
    }
}