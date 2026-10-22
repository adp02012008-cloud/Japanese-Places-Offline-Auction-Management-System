import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { confirmOfflineSale } from '@/lib/services/auctionService';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');

    let query = supabase.from('purchases').select('*').order('confirmed_at', { ascending: false });

    if (teamId) query = query.eq('team_id', teamId);
    if (status && status !== 'ALL') query = query.eq('status', status);

    const { data: purchases, error } = await query;
    if (error) throw error;

    const mapped = (purchases || []).map((p) => ({
      _id: String(p.id),
      placeId: String(p.place_id),
      placeName: p.place_name,
      teamId: String(p.team_id),
      teamName: p.team_name,
      finalPurchasePrice: Number(p.final_purchase_price),
      actualWorthAtSale: Number(p.actual_worth_at_sale),
      status: p.status,
      confirmedAt: p.confirmed_at,
      adminId: p.admin_id,
      adminUsername: p.admin_username,
      notes: p.notes,
    }));

    return NextResponse.json({ success: true, purchases: mapped });
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
