import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Purchase from '@/models/Purchase';
import { confirmOfflineSale } from '@/lib/services/auctionService';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');

    const filter: Record<string, any> = {};
    if (teamId) filter.teamId = teamId;
    if (status && status !== 'ALL') filter.status = status;

    const purchases = await Purchase.find(filter).sort({ confirmedAt: -1 }).lean();

    return NextResponse.json({ success: true, purchases });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const body = await req.json();
    const { placeId, teamId, finalPurchasePrice, notes } = body;

    if (!placeId || !teamId || finalPurchasePrice === undefined) {
      return NextResponse.json(
        { error: 'placeId, teamId, and finalPurchasePrice are required.' },
        { status: 400 }
      );
    }

    const priceNum = Number(finalPurchasePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Final purchase price must be a non-negative number.' }, { status: 400 });
    }

    // Execute atomic sale transaction
    const result = await confirmOfflineSale({
      placeId,
      teamId,
      finalPurchasePrice: priceNum,
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Sale confirmed and budget deducted successfully.',
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Transaction failed.' }, { status: 400 });
  }
}
