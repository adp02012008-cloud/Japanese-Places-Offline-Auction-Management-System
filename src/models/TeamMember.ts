import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeamMemberDocument extends Document {
  teamId: mongoose.Types.ObjectId;
  fullName: string;
  enrollmentNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Enrollment number is required'],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index for enrollment number across the event
TeamMemberSchema.index(
  { enrollmentNumber: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

export const TeamMember: Model<ITeamMemberDocument> =
  mongoose.models.TeamMember || mongoose.model<ITeamMemberDocument>('TeamMember', TeamMemberSchema);

export default TeamMember;
