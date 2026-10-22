import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Place from '@/models/Place';
import Team from '@/models/Team';
import EventSettings from '@/models/EventSettings';

/**
 * Large-Screen Presentation Data Endpoint.
 * Strictly excludes actualWorth from public and projector screens.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const settings = await EventSettings.findOne().lean();
    const currency = settings?.currency || '₹';
    const eventName = settings?.eventName || 'Japanese Places Offline Auction 2026';

    // 1. Fetch places WITHOUT actualWorth
    const places = await Place.find()
      .select('-actualWorth')
      .sort({ createdAt: 1 })
      .lean();

    // 2. Fetch approved participating teams with their remaining budgets
    const teams = await Team.find({
      approvalStatus: 'APPROVED',
      participationStatus: 'ACTIVE',
    })
      .select('teamName remainingBudget totalSpent startingBudget')
      .sort({ teamName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      eventName,
      currency,
      places,
      teams,
    });
  } catch (err) {
    console.error('Error fetching presentation data:', err);
    return NextResponse.json({ error: 'Failed to load presentation feed.' }, { status: 500 });
  }
}
