// src\model\Mandal.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMandal extends Document {
  nameEn: string;
  nameGu: string;
  userName: string;
  phoneNumber: string;
  password: string;
  establishedDate: string;
  isActive:boolean
  matchPassword: (password: string) => Promise<boolean>;
}

const MandalSchema: Schema = new Schema({
  nameEn: {
    type: String,
    required: [true, 'Mandal name (English) is required'],
    trim: true,
  },
  nameGu: {
    type: String,
    required: [true, 'Mandal name (Gujarati) is required'],
    trim: true,
  },
  userName: {
    type: String,
    required: [true, 'Mandal user name is required'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  establishedDate: {
    type: Date,
    required: [true, 'Established date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Pre-save hook to hash password
MandalSchema.pre('save', async function (this: IMandal, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Method to compare passwords
MandalSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.models.userMandal || mongoose.model<IMandal>('userMandal', MandalSchema);