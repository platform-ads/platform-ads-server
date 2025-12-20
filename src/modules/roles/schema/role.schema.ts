import mongoose, { Document } from 'mongoose';

export const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: ['admin', 'user'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type RoleDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
};
