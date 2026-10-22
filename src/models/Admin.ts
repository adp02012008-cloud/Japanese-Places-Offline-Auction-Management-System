import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminDocument extends Document {
  username: string;
  passwordHash: string;
  role: 'ADMIN';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return in default queries
    },
    role: {
      type: String,
      default: 'ADMIN',
      enum: ['ADMIN'],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);

export default Admin;
