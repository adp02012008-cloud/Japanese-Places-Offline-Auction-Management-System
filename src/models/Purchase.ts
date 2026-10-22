import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionStatus = 'CONFIRMED' | 'CANCELLED';

export interface IPurchaseDocument extends Document {
  placeId: mongoose.Types.ObjectId;
  placeName: string;
  teamId: mongoose.Types.ObjectId;
  teamName: string;
  finalPurchasePrice: number;
  actualWorthAtSale: number;
  status: TransactionStatus;
  confirmedAt: Date;
  adminId: string;
  adminUsername: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchaseDocument>(
  {
    placeId: {
      type: Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Place ID is required'],
    },
    placeName: {
      type: String,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
      index: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    finalPurchasePrice: {
      type: Number,
      required: [true, 'Final purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    actualWorthAtSale: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
    adminId: {
      type: String,
      required: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL CONSTRAINT: A place cannot have multiple active confirmed purchases!
PurchaseSchema.index(
  { placeId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'CONFIRMED' },
  }
);

export const Purchase: Model<IPurchaseDocument> =
  mongoose.models.Purchase || mongoose.model<IPurchaseDocument>('Purchase', PurchaseSchema);

export default Purchase;
