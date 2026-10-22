import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Large-Screen Presentation Data Endpoint.
 * Strictly excludes actual_worth from public and projector screens.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: settings } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();
    const currency = settings?.currency || '₹';
    const eventName = settings?.event_name || 'Japanese Places Offline Auction 2026';

    // 1. Fetch places WITHOUT actual_worth
    const { data: places } = await supabase
      .from('places')
      .select('id, place_name, description, image_url, starting_price, status, winning_team_name, final_purchase_price')
      .order('created_at', { ascending: true });

    // 2. Fetch approved participating teams with their remaining budgets
    const { data: teams } = await supabase
      .from('teams')
      .select('id, team_name, remaining_budget, total_spent, starting_budget')
      .eq('approval_status', 'APPROVED')
      .eq('participation_status', 'ACTIVE')
      .order('team_name', { ascending: true });

    const mappedPlaces = (places || []).map((p) => ({
      _id: String(p.id),
      placeName: p.place_name,
      description: p.description,
      imageUrl: p.image_url,
      startingPrice: Number(p.starting_price),
      status: p.status,
      winningTeamName: p.winning_team_name,
      finalPurchasePrice: p.final_purchase_price ? Number(p.final_purchase_price) : undefined,
    }));

    const mappedTeams = (teams || []).map((t) => ({
      _id: String(t.id),
      teamName: t.team_name,
      remainingBudget: Number(t.remaining_budget),
      totalSpent: Number(t.total_spent),
      startingBudget: Number(t.starting_budget),
    }));

    let publicAnnouncement = null;
    if (settings?.is_announcement_public) {
      const { calculateEventResults } = await import('@/lib/services/calculationEngine');
      const results = await calculateEventResults();
      publicAnnouncement = {
        isPublic: true,
        noPositiveSavings: results.noPositiveSavings,
        hasBreakEvenTeam: results.hasBreakEvenTeam,
        announcementMessage: results.announcementMessage,
        announcementLabel: results.announcementLabel,
        winningTeamName: results.winner?.teamName || null,
        bestPerformingTeamName: results.bestPerformingTeam?.teamName || null,
        placesPurchased: (results.winner || results.bestPerformingTeam)?.placesPurchased || 0,
      };
    }

    return NextResponse.json({
      success: true,
      eventName,
      currency,
      places: mappedPlaces,
      teams: mappedTeams,
      publicAnnouncement,
    });
  } catch (err) {
    console.error('Error fetching presentation data:', err);
    return NextResponse.json({ error: 'Failed to load presentation feed.' }, { status: 500 });
  }
}
