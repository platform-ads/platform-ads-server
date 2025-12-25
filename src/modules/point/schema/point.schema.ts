import mongoose, { Document } from 'mongoose';

export type EnumPointType = 'WHEEL' | 'SPEND' | 'ADMIN-ADJUST' | 'ADMIN-BONUS';

// Schema lưu số dư hiện tại của người dùng
export const PointBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: { type: Number, required: true, default: 0 },
  },
  { versionKey: false, timestamps: true },
);

// Schema lưu lịch sử giao dịch
export const PointHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true }, // Số điểm thay đổi (+ hoặc -)
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'WHEEL',
        'SPEND',
        'ADMIN-ADJUST',
        'ADMIN-BONUS',
      ] as EnumPointType[],
    },
  },
  { versionKey: false, timestamps: true },
);

export type PointBalanceDocument = Document & {
  userId: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PointHistoryDocument = Document & {
  userId: mongoose.Types.ObjectId;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  type: EnumPointType;
  createdAt: Date;
  updatedAt: Date;
};
