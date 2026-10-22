import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLogDocument extends Document {
  adminId: string;
  adminUsername: string;
  actionType: string;
  affectedRecordType: string;
  affectedRecordId: string;
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  reason?: string;
  timestamp: Date;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      index: true, // e.g., 'SALE_CONFIRMATION', 'SALE_CANCELLATION', 'BUDGET_CHANGE', 'VALUATION_UPDATE', 'WINNER_ANNOUNCEMENT'
    },
    affectedRecordType: {
      type: String,
      required: true, // 'Purchase', 'Place', 'Team', 'EventSettings'
    },
    affectedRecordId: {
      type: String,
      required: true,
      index: true,
    },
    beforeValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    afterValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
