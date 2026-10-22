import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};
    if (search) {
      filter.teamName = { $regex: search, $options: 'i' };
    }
    if (status && status !== 'ALL') {
      filter.approvalStatus = status;
    }

    const teams = await Team.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, teams });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { teamId, approvalStatus, participationStatus, startingBudget } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const beforeState = {
      approvalStatus: team.approvalStatus,
      participationStatus: team.participationStatus,
      startingBudget: team.startingBudget,
      remainingBudget: team.remainingBudget,
    };

    if (approvalStatus && ['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      team.approvalStatus = approvalStatus;
    }

    if (participationStatus && ['ACTIVE', 'INACTIVE'].includes(participationStatus)) {
      team.participationStatus = participationStatus;
    }

    if (typeof startingBudget === 'number' && startingBudget >= 0) {
      const budgetDiff = startingBudget - team.startingBudget;
      team.startingBudget = startingBudget;
      team.remainingBudget = Math.max(0, team.remainingBudget + budgetDiff);
    }

    await team.save();

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'TEAM_STATUS_UPDATE',
      affectedRecordType: 'Team',
      affectedRecordId: team._id.toString(),
      beforeValue: beforeState,
      afterValue: {
        approvalStatus: team.approvalStatus,
        participationStatus: team.participationStatus,
        startingBudget: team.startingBudget,
        remainingBudget: team.remainingBudget,
      },
      reason: `Updated team status/budget for ${team.teamName}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, team });
  } catch (err) {
    return handleAuthError(err);
  }
}
