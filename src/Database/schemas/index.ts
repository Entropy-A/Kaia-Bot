import mongoose, {Schema, Types} from "mongoose";

export * from "./stats.js"

export interface IUser extends mongoose.Document {
    _id: Types.ObjectId;
    aliases: string[];
}

export interface IGuild extends mongoose.Document {
    _id: Types.ObjectId;
    guildId: string;
    stats: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    aliases: [{ type: String, unique: true, default: [] }],
});

const guildSchema = new Schema<IGuild>({
    guildId: { type: String, unique: true, required: true },
    stats: [{ type: Schema.Types.ObjectId, ref: "Stat" }],
});

export const MUser = mongoose.model<IUser>("User", userSchema);
export const MGuild = mongoose.model<IGuild>("Guild", guildSchema);