import mongoose, { Schema, Document } from "mongoose";

export interface IMemberData extends Document {
  mandal: mongoose.Types.ObjectId;
  subUser: mongoose.Types.ObjectId;
  month: string;
  installment: number;
  amount: number;
  interest: number;
  fine: number;
  withdrawal: number;
  newWithdrawal: number;
  total: number;
}

const MemberDataSchema: Schema = new Schema({
  mandal: { type: Schema.Types.ObjectId, ref: "userMandal", required: true },
  subUser: { type: Schema.Types.ObjectId, ref: "MandalSubUser", required: true },
  month: { type: String, required: true },
  installment: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  interest: { type: Number, default: 0 },
  fine: { type: Number, default: 0 },
  withdrawal: { type: Number, default: 0 },
  newWithdrawal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

export default mongoose.models.MemberData ||
  mongoose.model<IMemberData>("MemberData", MemberDataSchema);