import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Team from '@/models/Team';
import Purchase from '@/models/Purchase';
import TeamMember from '@/models/TeamMember';
import EventSettings from '@/models/EventSettings';
import { requireTeam, handleAuthError } from '@/lib/auth/rbac';

export async function GET() {
  try {
    const session = await requireTeam();
    await connectToDatabase();

    const team = await Team.findById(session.teamId).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const settings = await EventSettings.findOne().lean();
    const currency = settings?.currency || '₹';

    // Fetch team members
    const members = await TeamMember.find({ teamId: team._id })
      .select('fullName enrollmentNumber')
      .lean();

    // Fetch only this team's purchases WITHOUT actualWorthAtSale
    const purchases = await Purchase.find({ teamId: team._id, status: 'CONFIRMED' })
      .select('placeId placeName finalPurchasePrice confirmedAt notes')
      .sort({ confirmedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      currency,
      team: {
        _id: team._id.toString(),
        teamName: team.teamName,
        approvalStatus: team.approvalStatus,
        participationStatus: team.participationStatus,
        startingBudget: team.startingBudget,
        remainingBudget: team.remainingBudget,
        totalSpent: team.totalSpent,
        placesCount: purchases.length,
      },
      members,
      purchasedPlaces: purchases,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
