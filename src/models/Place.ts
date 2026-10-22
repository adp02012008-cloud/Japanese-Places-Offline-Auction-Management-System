import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlaceStatus = 'NOT_SOLD' | 'SOLD' | 'WITHDRAWN';

export interface IPlaceDocument extends Document {
  placeName: string;
  description: string;
  imageUrl: string;
  imageStoragePath?: string;
  startingPrice: number;
  actualWorth: number; // Confidential
  status: PlaceStatus;
  winningTeamId?: mongoose.Types.ObjectId;
  winningTeamName?: string;
  finalPurchasePrice?: number;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlaceDocument>(
  {
    placeName: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    imageStoragePath: {
      type: String,
      default: '',
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Starting price cannot be negative'],
    },
    actualWorth: {
      type: Number,
      required: [true, 'Actual worth is required'],
      min: [0, 'Actual worth cannot be negative'],
    },
    status: {
      type: String,
      enum: ['NOT_SOLD', 'SOLD', 'WITHDRAWN'],
      default: 'NOT_SOLD',
      index: true,
    },
    winningTeamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    winningTeamName: {
      type: String,
      default: '',
    },
    finalPurchasePrice: {
      type: Number,
      default: null,
      min: 0,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Place: Model<IPlaceDocument> =
  mongoose.models.Place || mongoose.model<IPlaceDocument>('Place', PlaceSchema);

export default Place;
