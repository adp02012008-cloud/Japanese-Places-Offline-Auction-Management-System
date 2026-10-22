import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: place, error } = await supabase.from('places').select('*').eq('id', params.id).single();
    if (error || !place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      place: {
        _id: String(place.id),
        placeName: place.place_name,
        description: place.description,
        imageUrl: place.image_url,
        startingPrice: Number(place.starting_price),
        actualWorth: Number(place.actual_worth),
        status: place.status,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: place, error: fetchErr } = await supabase.from('places').select('*').eq('id', params.id).single();
    if (fetchErr || !place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { placeName, description, imageUrl, startingPrice, actualWorth, status } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (placeName) updates.place_name = placeName.trim();
    if (description) updates.description = description.trim();
    if (imageUrl) updates.image_url = imageUrl;

    if (startingPrice !== undefined) {
      const sp = Number(startingPrice);
      if (!isNaN(sp) && sp >= 0) updates.starting_price = sp;
    }

    if (actualWorth !== undefined) {
      const aw = Number(actualWorth);
      if (!isNaN(aw) && aw >= 0) updates.actual_worth = aw;
    }

    if (status && ['NOT_SOLD', 'SOLD', 'WITHDRAWN'].includes(status)) {
      updates.status = status;
    }

    const { data: updatedPlace, error: updateErr } = await supabase
      .from('places')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'PLACE_UPDATE',
      affected_record_type: 'Place',
      affected_record_id: String(params.id),
      before_value: {
        place_name: place.place_name,
        starting_price: place.starting_price,
        actual_worth: place.actual_worth,
        status: place.status,
      },
      after_value: updates,
      reason: `Updated landmark: ${updatedPlace.place_name}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      place: {
        _id: String(updatedPlace.id),
        placeName: updatedPlace.place_name,
        description: updatedPlace.description,
        imageUrl: updatedPlace.image_url,
        startingPrice: Number(updatedPlace.starting_price),
        actualWorth: Number(updatedPlace.actual_worth),
        status: updatedPlace.status,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: place, error: fetchErr } = await supabase.from('places').select('*').eq('id', params.id).single();
    if (fetchErr || !place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    if (place.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot withdraw or delete a place that has already been confirmed as sold.' },
        { status: 400 }
      );
    }

    await supabase.from('places').update({ status: 'WITHDRAWN' }).eq('id', params.id);

    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'PLACE_WITHDRAW',
      affected_record_type: 'Place',
      affected_record_id: String(params.id),
      before_value: { status: 'NOT_SOLD' },
      after_value: { status: 'WITHDRAWN' },
      reason: `Withdrawn landmark ${place.place_name} from auction`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Place marked as withdrawn.' });
  } catch (err) {
    return handleAuthError(err);
  }
}
