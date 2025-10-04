import mongoose, { Schema, Document } from "mongoose";

export interface IMandalSubUser extends Document {
  mandal: mongoose.Types.ObjectId;
  subUserName: string;
  phoneNumber: string;
}

const MandalSubUserSchema: Schema = new Schema({
  mandal: { type: Schema.Types.ObjectId, ref: "userMandal", required: true },
  subUserName: {
    type: String,
    required: [true, "Sub-user name is required"],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
  },
});

export default mongoose.models.MandalSubUser ||
  mongoose.model<IMandalSubUser>("MandalSubUser", MandalSubUserSchema);
