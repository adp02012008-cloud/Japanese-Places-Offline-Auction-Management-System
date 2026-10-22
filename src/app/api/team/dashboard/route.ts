import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireTeam, handleAuthError } from '@/lib/auth/rbac';

export async function GET() {
  try {
    const session = await requireTeam();
    const supabase = getSupabaseAdmin();

    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*')
      .eq('id', session.teamId)
      .single();

    if (teamErr || !team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const { data: settings } = await supabase.from('event_settings').select('currency').limit(1).maybeSingle();
    const currency = settings?.currency || '₹';

    // Fetch team members
    const { data: members } = await supabase
      .from('team_members')
      .select('full_name, enrollment_number')
      .eq('team_id', team.id);

    // Fetch ONLY this team's purchases WITHOUT actual_worth_at_sale
    const { data: purchases } = await supabase
      .from('purchases')
      .select('place_id, place_name, final_purchase_price, confirmed_at, notes')
      .eq('team_id', team.id)
      .eq('status', 'CONFIRMED')
      .order('confirmed_at', { ascending: false });

    return NextResponse.json({
      success: true,
      currency,
      team: {
        _id: String(team.id),
        teamName: team.team_name,
        approvalStatus: team.approval_status,
        participationStatus: team.participation_status,
        startingBudget: Number(team.starting_budget),
        remainingBudget: Number(team.remaining_budget),
        totalSpent: Number(team.total_spent),
        placesCount: (purchases || []).length,
      },
      members: (members || []).map((m) => ({
        fullName: m.full_name,
        enrollmentNumber: m.enrollment_number,
      })),
      purchasedPlaces: (purchases || []).map((p) => ({
        placeId: String(p.place_id),
        placeName: p.place_name,
        finalPurchasePrice: Number(p.final_purchase_price),
        confirmedAt: p.confirmed_at,
        notes: p.notes,
      })),
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
