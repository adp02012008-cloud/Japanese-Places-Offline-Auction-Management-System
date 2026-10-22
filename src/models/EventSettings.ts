import mongoose, { Schema, Document, Model } from 'mongoose';

export type WinningRule = 'SAVINGS' | 'EFFICIENCY' | 'ACTUAL_WORTH';

export interface IEventSettingsDocument extends Document {
  eventName: string;
  startingBudgetPerTeam: number;
  currency: string;
  activeWinningRule: WinningRule;
  isRegistrationOpen: boolean;
  requireAdminApproval: boolean;
  isAnnouncementPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSettingsSchema = new Schema<IEventSettingsDocument>(
  {
    eventName: {
      type: String,
      default: 'Japanese Places Offline Auction 2026',
      required: true,
    },
    startingBudgetPerTeam: {
      type: Number,
      default: 100000,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: '₹',
      required: true,
    },
    activeWinningRule: {
      type: String,
      enum: ['SAVINGS', 'EFFICIENCY', 'ACTUAL_WORTH'],
      default: 'SAVINGS',
      required: true,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    requireAdminApproval: {
      type: Boolean,
      default: true,
    },
    isAnnouncementPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const EventSettings: Model<IEventSettingsDocument> =
  mongoose.models.EventSettings ||
  mongoose.model<IEventSettingsDocument>('EventSettings', EventSettingsSchema);

export default EventSettings;
