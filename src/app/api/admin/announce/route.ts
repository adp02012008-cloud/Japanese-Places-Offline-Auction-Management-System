import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import EventSettings from '@/models/EventSettings';
import AuditLog from '@/models/AuditLog';
import { calculateEventResults } from '@/lib/services/calculationEngine';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { isAnnouncementPublic } = body;

    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = await EventSettings.create({});
    }

    const previousStatus = settings.isAnnouncementPublic;
    settings.isAnnouncementPublic = Boolean(isAnnouncementPublic);
    await settings.save();

    const resultMetrics = await calculateEventResults();

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'WINNER_ANNOUNCEMENT_TOGGLE',
      affectedRecordType: 'EventSettings',
      affectedRecordId: settings._id.toString(),
      beforeValue: { isAnnouncementPublic: previousStatus },
      afterValue: {
        isAnnouncementPublic: settings.isAnnouncementPublic,
        winner: resultMetrics.winner?.teamName,
      },
      reason: settings.isAnnouncementPublic
        ? `Officially announced winner: ${resultMetrics.winner?.teamName || 'None'}`
        : 'Revoked public winner announcement',
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      isAnnouncementPublic: settings.isAnnouncementPublic,
      winner: resultMetrics.winner,
      isTie: resultMetrics.isTie,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
