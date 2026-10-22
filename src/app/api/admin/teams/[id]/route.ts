import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*')
      .eq('id', params.id)
      .single();

    if (teamErr || !team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id);

    const { data: purchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('team_id', team.id)
      .eq('status', 'CONFIRMED');

    return NextResponse.json({
      success: true,
      team: {
        _id: String(team.id),
        teamName: team.team_name,
        username: team.username,
        memberCount: team.member_count,
        approvalStatus: team.approval_status,
        participationStatus: team.participation_status,
        startingBudget: Number(team.starting_budget),
        remainingBudget: Number(team.remaining_budget),
        totalSpent: Number(team.total_spent),
        totalActualWorth: Number(team.total_actual_worth),
        createdAt: team.created_at,
      },
      members: (members || []).map((m) => ({
        _id: String(m.id),
        fullName: m.full_name,
        enrollmentNumber: m.enrollment_number,
      })),
      purchases: (purchases || []).map((p) => ({
        _id: String(p.id),
        placeName: p.place_name,
        finalPurchasePrice: Number(p.final_purchase_price),
        actualWorthAtSale: Number(p.actual_worth_at_sale),
        confirmedAt: p.confirmed_at,
      })),
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
