import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Place from '@/models/Place';

/**
 * Public and Team catalogue endpoint.
 * STRICT PRIVACY REQUIREMENT: Confidential actualWorth is NEVER returned.
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const filter: Record<string, any> = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search) {
      filter.placeName = { $regex: search, $options: 'i' };
    }

    // STRICT PROJECTION: Explicitly exclude actualWorth!
    const places = await Place.find(filter)
      .select('-actualWorth')
      .sort({ placeName: 1 })
      .lean();

    return NextResponse.json({ success: true, places });
  } catch (err) {
    console.error('Error fetching catalogue places:', err);
    return NextResponse.json({ error: 'Failed to load Japanese places catalogue.' }, { status: 500 });
  }
}
