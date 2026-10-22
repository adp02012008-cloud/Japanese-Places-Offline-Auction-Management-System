import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ITeamResult, WinningRule } from '@/types';

/**
 * Computes authoritative rankings and metrics directly from Supabase purchase records.
 */
export async function calculateEventResults(): Promise<{
  results: ITeamResult[];
  activeRule: WinningRule;
  currency: string;
  startingBudget: number;
  winner: ITeamResult | null;
  isTie: boolean;
}> {
  const supabase = getSupabaseAdmin();

  // 1. Fetch settings
  const { data: settings } = await supabase.from('event_settings').select('*').limit(1).single();
  const activeRule: WinningRule = (settings?.active_winning_rule as WinningRule) || 'SAVINGS';
  const currency = settings?.currency || '₹';
  const startingBudget = Number(settings?.starting_budget_per_team ?? 100000);

  // 2. Fetch approved participating teams
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('approval_status', 'APPROVED');

  const teamList = teams || [];

  // 3. Fetch all confirmed purchases
  const { data: confirmedPurchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('status', 'CONFIRMED');

  const purchaseList = confirmedPurchases || [];

  // Map purchases by team_id
  const purchasesByTeam = new Map<string, typeof purchaseList>();
  for (const purchase of purchaseList) {
    const tId = String(purchase.team_id);
    if (!purchasesByTeam.has(tId)) {
      purchasesByTeam.set(tId, []);
    }
    purchasesByTeam.get(tId)!.push(purchase);
  }

  // Calculate metrics for each team
  const calculatedTeams: Omit<ITeamResult, 'rank'>[] = teamList.map((team) => {
    const teamIdStr = String(team.id);
    const teamPurchases = purchasesByTeam.get(teamIdStr) || [];

    const totalSpent = teamPurchases.reduce((acc, p) => acc + Number(p.final_purchase_price), 0);
    const totalActualWorth = teamPurchases.reduce((acc, p) => acc + Number(p.actual_worth_at_sale), 0);
    const totalSavings = totalActualWorth - totalSpent;
    const remainingBudget = Math.max(0, startingBudget - totalSpent);
    const placesPurchased = teamPurchases.length;

    const valueEfficiency =
      totalSpent > 0 ? Number(((totalActualWorth / totalSpent) * 100).toFixed(2)) : null;

    const budgetUtilization =
      startingBudget > 0 ? Number(((totalSpent / startingBudget) * 100).toFixed(2)) : null;

    const savingsStatus =
      totalSavings > 0 ? 'POSITIVE' : totalSavings === 0 ? 'BREAK_EVEN' : 'OVERPAID';

    return {
      teamId: teamIdStr,
      teamName: team.team_name,
      placesPurchased,
      totalActualWorth,
      totalSpent,
      totalSavings,
      remainingBudget,
      valueEfficiency,
      budgetUtilization,
      savingsStatus,
      purchasedPlaces: teamPurchases.map((p) => ({
        placeId: String(p.place_id),
        placeName: p.place_name,
        finalPrice: Number(p.final_purchase_price),
        actualWorth: Number(p.actual_worth_at_sale),
      })),
    };
  });

  // Sort based on active rule and tie-breakers
  calculatedTeams.sort((a, b) => {
    if (activeRule === 'SAVINGS') {
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      if (b.totalActualWorth !== a.totalActualWorth) {
        return b.totalActualWorth - a.totalActualWorth;
      }
      return a.totalSpent - b.totalSpent;
    }

    if (activeRule === 'EFFICIENCY') {
      const effA = a.valueEfficiency ?? -1;
      const effB = b.valueEfficiency ?? -1;
      if (effB !== effA) {
        return effB - effA;
      }
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      return a.totalSpent - b.totalSpent;
    }

    if (activeRule === 'ACTUAL_WORTH') {
      if (b.totalActualWorth !== a.totalActualWorth) {
        return b.totalActualWorth - a.totalActualWorth;
      }
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      return a.totalSpent - b.totalSpent;
    }

    return 0;
  });

  const rankedResults: ITeamResult[] = calculatedTeams.map((team, idx) => ({
    ...team,
    rank: idx + 1,
  }));

  // Best-performing team based on ranked sorting
  const bestPerformingTeam = rankedResults.length > 0 ? rankedResults[0] : null;

  // Determine tie-breaker status for the top position
  let isTie = false;
  if (rankedResults.length >= 2) {
    const first = rankedResults[0];
    const second = rankedResults[1];
    if (
      first.totalSavings === second.totalSavings &&
      first.totalActualWorth === second.totalActualWorth &&
      first.totalSpent === second.totalSpent
    ) {
      isTie = true;
    }
  }

  // Savings condition analysis
  const anyPositiveSavings = rankedResults.some((t) => t.totalSavings > 0);
  const noPositiveSavings = rankedResults.length > 0 && !anyPositiveSavings;
  const hasBreakEvenTeam = rankedResults.some((t) => t.totalSavings === 0);

  let winner: ITeamResult | null = null;
  let announcementLabel = '';
  let announcementMessage = '';

  if (activeRule === 'SAVINGS') {
    if (anyPositiveSavings) {
      // Official winner with positive savings
      winner = rankedResults[0];
      announcementLabel = isTie ? 'Declared Official Tie' : 'Official Auction Champion';
      announcementMessage = `Winner: ${winner.teamName} achieved positive savings of ${currency}${winner.totalSavings.toLocaleString()}.`;
    } else {
      // SPECIAL WINNING RULE: WHEN EVERY TEAM OVERPAYS
      // Do not falsely announce a profitable winner!
      winner = null;
      announcementMessage = 'No team achieved positive savings.';

      if (hasBreakEvenTeam && bestPerformingTeam?.totalSavings === 0) {
        announcementLabel = isTie
          ? 'Best-Performing Team (Tie) — Broke Even'
          : 'Best-Performing Team — Broke Even';
      } else {
        announcementLabel = isTie
          ? 'Best-Performing Team (Tie) — All Teams Overpaid'
          : 'Best-Performing Team — All Teams Overpaid';
      }
    }
  } else {
    // Configurable alternative rules (EFFICIENCY, ACTUAL_WORTH)
    winner = rankedResults.length > 0 ? rankedResults[0] : null;
    if (noPositiveSavings) {
      announcementMessage = 'No team achieved positive savings.';
      announcementLabel = isTie
        ? `Best-Performing Team (Tie, ${activeRule}) — All Teams Overpaid`
        : `Best-Performing Team (${activeRule}) — All Teams Overpaid`;
    } else {
      announcementLabel = isTie
        ? 'Declared Official Tie'
        : `Official Auction Champion (${activeRule})`;
      announcementMessage = `Official Winner: ${winner?.teamName}`;
    }
  }

  return {
    results: rankedResults,
    activeRule,
    currency,
    startingBudget,
    winner,
    bestPerformingTeam,
    noPositiveSavings,
    hasBreakEvenTeam,
    announcementMessage,
    announcementLabel,
    isTie,
  };
}
