import mongoose, { Schema, Document } from "mongoose";

export interface IMemberData extends Document {
  mandal: mongoose.Types.ObjectId;
  subUser: mongoose.Types.ObjectId;
  monthId: string;
  installment: number;
  withdrawal: number;
  fine: number;
  interest: number;
  paidWithdrawal: number;
  newWithdrawal: number;
  total: number;
  pendingInstallment: number; 
  paidInstallment : number ;
  paidInterest?: number; 
  pendingInterest: number;  
}

const MemberDataSchema: Schema = new Schema({
  mandal: { type: Schema.Types.ObjectId, ref: "userMandal", required: true },
  subUser: {
    type: Schema.Types.ObjectId,
    ref: "MandalSubUser",
    required: true,
  },
  monthId: { type: Schema.Types.ObjectId, ref: "MandalMonths", required: true },
  interest: { type: Number, default: 0 },
  paidInterest: { type: Number, default: 0 },
  fine: { type: Number, default: 0 },
  paidWithdrawal: { type: Number, default: 0 },
  newWithdrawal: { type: Number, default: 0 },
  withdrawal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  installment: { type: Number, default: 0 },
  pendingInstallment: { type: Number, default: 0 }, 
  paidInstallment : { type: Number, default: 0 }, 
  pendingInterest: { type: Number, default: 0 },
});

MemberDataSchema.virtual('formatted').get(function () {
  const doc = this.toObject({ virtuals: false });
  const numericFields = [
    'interest',
    'paidInterest',
    'fine',
    'paidWithdrawal',
    'newWithdrawal',
    'withdrawal',
    'total',
    'installment',
    'pendingInstallment',
    'paidInstallment',
    'pendingInterest',
  ];

  numericFields.forEach(field => {
    if (typeof doc[field] === 'number') {
      doc[field] = Number(doc[field].toFixed(2));
    }
  });

  return doc;
});

MemberDataSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return ret.formatted || ret;
  }
});

export default mongoose.models.MemberData ||
  mongoose.model<IMemberData>("MemberData", MemberDataSchema);