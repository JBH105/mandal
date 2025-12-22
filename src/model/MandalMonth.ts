import mongoose, { Schema, Document } from "mongoose";

export interface IMandalMonth extends Document {
  mandal: mongoose.Types.ObjectId;
  month: string;
  createdAt: Date;
  updatedAt: Date;
}

const MandalMonthSchema: Schema = new Schema(
  {
    mandal: { type: Schema.Types.ObjectId, ref: "userMandal", required: true },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MandalMonth ||
  mongoose.model<IMandalMonth>("MandalMonth", MandalMonthSchema);
