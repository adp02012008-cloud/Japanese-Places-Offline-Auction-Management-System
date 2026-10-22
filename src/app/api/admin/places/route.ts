import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = supabase.from('places').select('*').order('created_at', { ascending: false });

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
      actualWorth: Number(p.actual_worth), // Permitted for Admin!
      status: p.status,
      winningTeamId: p.winning_team_id ? String(p.winning_team_id) : undefined,
      winningTeamName: p.winning_team_name,
      finalPurchasePrice: p.final_purchase_price ? Number(p.final_purchase_price) : undefined,
      soldAt: p.sold_at,
      createdAt: p.created_at,
    }));

    return NextResponse.json({ success: true, places: mapped });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const body = await req.json();
    const { placeName, description, imageUrl, imageStoragePath, startingPrice, actualWorth } = body;

    if (!placeName || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Place name, description, and image URL are required.' },
        { status: 400 }
      );
    }

    const startPriceNum = Number(startingPrice);
    const actualWorthNum = Number(actualWorth);

    if (isNaN(startPriceNum) || startPriceNum < 0) {
      return NextResponse.json({ error: 'Starting price must be a non-negative number.' }, { status: 400 });
    }

    if (isNaN(actualWorthNum) || actualWorthNum < 0) {
      return NextResponse.json({ error: 'Actual worth must be a non-negative number.' }, { status: 400 });
    }

    const trimmedName = placeName.trim();

    // Check duplicate
    const { data: existing } = await supabase
      .from('places')
      .select('id')
      .ilike('place_name', trimmedName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `A Japanese place with the name "${trimmedName}" already exists.` },
        { status: 409 }
      );
    }

    const { data: newPlace, error: insertError } = await supabase
      .from('places')
      .insert({
        place_name: trimmedName,
        description: description.trim(),
        image_url: imageUrl,
        image_storage_path: imageStoragePath || '',
        starting_price: startPriceNum,
        actual_worth: actualWorthNum,
        status: 'NOT_SOLD',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'PLACE_CREATION',
      affected_record_type: 'Place',
      affected_record_id: String(newPlace.id),
      after_value: {
        place_name: newPlace.place_name,
        starting_price: newPlace.starting_price,
        actual_worth: newPlace.actual_worth,
      },
      reason: `Created new Japanese landmark: ${newPlace.place_name}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      place: {
        _id: String(newPlace.id),
        placeName: newPlace.place_name,
        description: newPlace.description,
        imageUrl: newPlace.image_url,
        startingPrice: Number(newPlace.starting_price),
        actualWorth: Number(newPlace.actual_worth),
        status: newPlace.status,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
