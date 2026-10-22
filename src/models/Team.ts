import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeamDocument extends Document {
  teamName: string;
  memberCount: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  participationStatus: 'ACTIVE' | 'INACTIVE';
  startingBudget: number;
  remainingBudget: number;
  totalSpent: number;
  totalActualWorth: number;
  username: string;
  passwordHash?: string;
  firstLoginMustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    memberCount: {
      type: Number,
      required: [true, 'Member count is required'],
      min: [1, 'At least 1 member is required'],
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    participationStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    startingBudget: {
      type: Number,
      default: 100000,
      min: 0,
    },
    remainingBudget: {
      type: Number,
      default: 100000,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalActualWorth: {
      type: Number,
      default: 0,
      min: 0,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Never return in default queries
    },
    firstLoginMustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Case-insensitive unique index for team name
TeamSchema.index(
  { teamName: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

export const Team: Model<ITeamDocument> =
  mongoose.models.Team || mongoose.model<ITeamDocument>('Team', TeamSchema);

export default Team;
