import mongoose, { Schema, Document } from "mongoose";

export interface IMandalMonth extends Document {
  mandal: mongoose.Types.ObjectId;
  month: string;
  monthlyInstallment: number;
  createdAt: Date;
  updatedAt: Date;
}

const MandalMonthSchema: Schema = new Schema(
  {
    mandal: {
      type: Schema.Types.ObjectId,
      ref: "userMandal",
      required: true,
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true,
    },
    monthlyInstallment: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MandalMonth ||
  mongoose.model<IMandalMonth>("MandalMonth", MandalMonthSchema);
