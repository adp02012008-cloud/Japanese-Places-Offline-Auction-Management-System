import connectToDatabase from '@/lib/db/mongodb';
import Team from '@/models/Team';
import Purchase from '@/models/Purchase';
import EventSettings from '@/models/EventSettings';
import { ITeamResult, WinningRule } from '@/types';

/**
 * Computes authoritative rankings and metrics directly from confirmed Purchase records.
 * Uses integer/exact arithmetic where possible. Avoids floating point issues.
 */
export async function calculateEventResults(): Promise<{
  results: ITeamResult[];
  activeRule: WinningRule;
  currency: string;
  startingBudget: number;
  winner: ITeamResult | null;
  isTie: boolean;
}> {
  await connectToDatabase();

  const settings = await EventSettings.findOne().lean();
  const activeRule: WinningRule = (settings?.activeWinningRule as WinningRule) || 'SAVINGS';
  const currency = settings?.currency || '₹';
  const startingBudget = settings?.startingBudgetPerTeam ?? 100000;

  // Retrieve approved participating teams
  const teams = await Team.find({ approvalStatus: 'APPROVED' }).lean();

  // Retrieve all confirmed, non-cancelled purchases
  const confirmedPurchases = await Purchase.find({ status: 'CONFIRMED' }).lean();

  // Map purchases by teamId
  const purchasesByTeam = new Map<string, typeof confirmedPurchases>();
  for (const purchase of confirmedPurchases) {
    const tId = purchase.teamId.toString();
    if (!purchasesByTeam.has(tId)) {
      purchasesByTeam.set(tId, []);
    }
    purchasesByTeam.get(tId)!.push(purchase);
  }

  // Calculate metrics for each team
  const calculatedTeams: Omit<ITeamResult, 'rank'>[] = teams.map((team) => {
    const teamIdStr = team._id.toString();
    const teamPurchases = purchasesByTeam.get(teamIdStr) || [];

    const totalSpent = teamPurchases.reduce((acc, p) => acc + p.finalPurchasePrice, 0);
    const totalActualWorth = teamPurchases.reduce((acc, p) => acc + p.actualWorthAtSale, 0);
    const totalSavings = totalActualWorth - totalSpent;
    const remainingBudget = Math.max(0, startingBudget - totalSpent);
    const placesPurchased = teamPurchases.length;

    const valueEfficiency =
      totalSpent > 0 ? Number(((totalActualWorth / totalSpent) * 100).toFixed(2)) : null;

    const budgetUtilization =
      startingBudget > 0 ? Number(((totalSpent / startingBudget) * 100).toFixed(2)) : null;

    return {
      teamId: teamIdStr,
      teamName: team.teamName,
      placesPurchased,
      totalActualWorth,
      totalSpent,
      totalSavings,
      remainingBudget,
      valueEfficiency,
      budgetUtilization,
      purchasedPlaces: teamPurchases.map((p) => ({
        placeId: p.placeId.toString(),
        placeName: p.placeName,
        finalPrice: p.finalPurchasePrice,
        actualWorth: p.actualWorthAtSale,
      })),
    };
  });

  // Sort based on active rule and tie-breakers
  calculatedTeams.sort((a, b) => {
    if (activeRule === 'SAVINGS') {
      // Primary: Highest Total Savings
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      // Tie-breaker 1: Higher total actual worth acquired
      if (b.totalActualWorth !== a.totalActualWorth) {
        return b.totalActualWorth - a.totalActualWorth;
      }
      // Tie-breaker 2: Lower total amount spent
      return a.totalSpent - b.totalSpent;
    }

    if (activeRule === 'EFFICIENCY') {
      const effA = a.valueEfficiency ?? -1;
      const effB = b.valueEfficiency ?? -1;
      if (effB !== effA) {
        return effB - effA;
      }
      // Tie-breaker: higher savings
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      return a.totalSpent - b.totalSpent;
    }

    if (activeRule === 'ACTUAL_WORTH') {
      // Primary: Highest Total Actual Worth
      if (b.totalActualWorth !== a.totalActualWorth) {
        return b.totalActualWorth - a.totalActualWorth;
      }
      // Tie-breaker 1: Higher savings
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      return a.totalSpent - b.totalSpent;
    }

    return 0;
  });

  // Assign ranks
  const rankedResults: ITeamResult[] = calculatedTeams.map((team, idx) => ({
    ...team,
    rank: idx + 1,
  }));

  const winner = rankedResults.length > 0 ? rankedResults[0] : null;

  // Check if true tie exists at rank 1
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

  return {
    results: rankedResults,
    activeRule,
    currency,
    startingBudget,
    winner,
    isTie,
  };
}
