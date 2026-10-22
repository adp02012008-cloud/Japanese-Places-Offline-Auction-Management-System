import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';
import Purchase from '@/models/Purchase';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const team = await Team.findById(params.id).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const members = await TeamMember.find({ teamId: team._id }).lean();
    const purchases = await Purchase.find({ teamId: team._id, status: 'CONFIRMED' }).lean();

    return NextResponse.json({
      success: true,
      team,
      members,
      purchases,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
