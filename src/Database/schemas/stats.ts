import mongoose, {Schema, Types} from "mongoose";

export interface IStat extends mongoose.Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    owner: Types.ObjectId;
    permittedUsers: Types.ObjectId[];
    entries: Types.ObjectId[];
}

export interface IStatEntry extends mongoose.Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    owner: Types.ObjectId;
    permittedUsers: Types.ObjectId[];
    values: IStatEntryValue[];
}

export interface IStatEntryValue extends mongoose.Document {
    _id: Types.ObjectId;
    value: number;
    notes?: string;
    timestamp: Date;
}

const statEntryValuesSchema = new Schema<IStatEntryValue>({
    value: { type: Number, required: true },
    notes: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
});

const statEntrySchema = new Schema<IStatEntry>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    permittedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    values: [{type: statEntryValuesSchema, default: []}],
});

const statSchema = new Schema<IStat>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    permittedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    entries: [{ type: Schema.Types.ObjectId, ref: "Entry", default: [] }], // Store references instead of embedding
});

export const MStat = mongoose.model<IStat>("Stat", statSchema);
export const MEntry = mongoose.model<IStatEntry>("Entry", statEntrySchema);
export const MValue = mongoose.model<IStatEntryValue>("Value", statEntryValuesSchema);