import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Public and Team catalogue endpoint.
 * STRICT PRIVACY REQUIREMENT: Confidential actual_worth is NEVER selected or returned.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // STRICT PROJECTION: Explicitly exclude actual_worth!
    let query = supabase
      .from('places')
      .select('id, place_name, description, image_url, image_storage_path, starting_price, status, winning_team_id, winning_team_name, final_purchase_price, sold_at')
      .order('place_name', { ascending: true });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.ilike('place_name', `%${search}%`);
    }

    const { data: places, error } = await query;
    if (error) throw error;

    const mapped = (places || []).map((p) => ({
      _id: String(p.id),
      placeName: p.place_name,
      description: p.description,
      imageUrl: p.image_url,
      imageStoragePath: p.image_storage_path,
      startingPrice: Number(p.starting_price),
      status: p.status,
      winningTeamId: p.winning_team_id ? String(p.winning_team_id) : undefined,
      winningTeamName: p.winning_team_name,
      finalPurchasePrice: p.final_purchase_price ? Number(p.final_purchase_price) : undefined,
      soldAt: p.sold_at,
    }));

    return NextResponse.json({ success: true, places: mapped });
  } catch (err) {
    console.error('Error fetching catalogue places:', err);
    return NextResponse.json({ error: 'Failed to load Japanese places catalogue.' }, { status: 500 });
  }
}
