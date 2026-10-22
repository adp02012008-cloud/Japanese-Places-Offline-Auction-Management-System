import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import EventSettings from '@/models/EventSettings';
import AuditLog from '@/models/AuditLog';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    let settings = await EventSettings.findOne().lean();
    if (!settings) {
      await EventSettings.create({});
      settings = await EventSettings.findOne().lean();
    }

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { eventName, startingBudgetPerTeam, currency, activeWinningRule, isRegistrationOpen, requireAdminApproval } = body;

    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = await EventSettings.create({});
    }

    const beforeState = { ...settings.toObject() };

    if (eventName) settings.eventName = eventName.trim();
    if (currency) settings.currency = currency.trim();
    if (activeWinningRule && ['SAVINGS', 'EFFICIENCY', 'ACTUAL_WORTH'].includes(activeWinningRule)) {
      settings.activeWinningRule = activeWinningRule;
    }
    if (typeof isRegistrationOpen === 'boolean') {
      settings.isRegistrationOpen = isRegistrationOpen;
    }
    if (typeof requireAdminApproval === 'boolean') {
      settings.requireAdminApproval = requireAdminApproval;
    }
    if (typeof startingBudgetPerTeam === 'number' && startingBudgetPerTeam >= 0) {
      settings.startingBudgetPerTeam = startingBudgetPerTeam;
    }

    await settings.save();

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'EVENT_SETTINGS_UPDATE',
      affectedRecordType: 'EventSettings',
      affectedRecordId: settings._id.toString(),
      beforeValue: beforeState,
      afterValue: settings.toObject(),
      reason: 'Administrator updated event configuration settings',
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return handleAuthError(err);
  }
}
