import mongoose, { Document, Schema } from 'mongoose';

export interface IPassword extends Document {
  title: string;
  username: string;
  password: string; // encrypted password
  iv: string; // initialization vector
  site: string;
  notes: string;
  tags: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordSchema = new Schema<IPassword>(
  {
    title: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    iv: { type: String, required: true }, // store IV
    site: { type: String, required: true },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Password = mongoose.models.Password || mongoose.model<IPassword>('Password', PasswordSchema);