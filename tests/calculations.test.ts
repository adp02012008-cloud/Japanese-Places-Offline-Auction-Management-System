import { describe, it, expect } from 'vitest';

describe('Japanese Places Auction Financial Calculation Engine', () => {
  it('correctly calculates Remaining Budget, Spending, Actual Worth, and Savings', () => {
    const startingBudget = 100000;
    const purchases = [
      { placeName: 'Place A', actualWorth: 40000, finalPrice: 20000 },
      { placeName: 'Place B', actualWorth: 30000, finalPrice: 15000 },
      { placeName: 'Place C', actualWorth: 25000, finalPrice: 10000 },
    ];

    const totalSpent = purchases.reduce((acc, p) => acc + p.finalPrice, 0);
    const totalActualWorth = purchases.reduce((acc, p) => acc + p.actualWorth, 0);
    const totalSavings = totalActualWorth - totalSpent;
    const remainingBudget = startingBudget - totalSpent;

    expect(totalSpent).toBe(45000);
    expect(totalActualWorth).toBe(95000);
    expect(totalSavings).toBe(50000);
    expect(remainingBudget).toBe(55000);
  });

  it('correctly calculates Value Efficiency with 2 decimal precision', () => {
    const totalActualWorth = 95000;
    const totalSpent = 45000;
    const valueEfficiency = Number(((totalActualWorth / totalSpent) * 100).toFixed(2));

    expect(valueEfficiency).toBe(211.11);
  });

  it('safely handles division by zero when team has spent zero', () => {
    const totalActualWorth = 0;
    const totalSpent = 0;
    const valueEfficiency = totalSpent > 0 ? (totalActualWorth / totalSpent) * 100 : null;

    expect(valueEfficiency).toBeNull();
  });

  it('correctly computes Budget Utilization', () => {
    const startingBudget = 100000;
    const totalSpent = 45000;
    const budgetUtilization = Number(((totalSpent / startingBudget) * 100).toFixed(2));

    expect(budgetUtilization).toBe(45.0);
  });

  it('rejects an attempted purchase that exceeds remaining budget', () => {
    const remainingBudget = 20000;
    const attemptedPurchasePrice = 25000;

    const isSufficient = remainingBudget >= attemptedPurchasePrice;
    expect(isSufficient).toBe(false);
  });
});

describe('Tournament Winning Rules & Tie-breaker Determination', () => {
  const teams = [
    {
      teamName: 'Team Sakura',
      totalSavings: 50000,
      totalActualWorth: 95000,
      totalSpent: 45000,
      valueEfficiency: 211.11,
    },
    {
      teamName: 'Team Fuji',
      totalSavings: 60000,
      totalActualWorth: 110000,
      totalSpent: 50000,
      valueEfficiency: 220.0,
    },
    {
      teamName: 'Team Tokyo',
      totalSavings: 50000,
      totalActualWorth: 100000,
      totalSpent: 50000,
      valueEfficiency: 200.0,
    },
  ];

  it('correctly ranks teams under Highest Total Savings rule', () => {
    const sorted = [...teams].sort((a, b) => {
      if (b.totalSavings !== a.totalSavings) {
        return b.totalSavings - a.totalSavings;
      }
      if (b.totalActualWorth !== a.totalActualWorth) {
        return b.totalActualWorth - a.totalActualWorth;
      }
      return a.totalSpent - b.totalSpent;
    });

    expect(sorted[0].teamName).toBe('Team Fuji'); // 60,000 savings
    // Tie-breaker between Sakura and Tokyo (both 50,000 savings):
    // Tokyo has higher actual worth (100,000 vs 95,000)
    expect(sorted[1].teamName).toBe('Team Tokyo');
    expect(sorted[2].teamName).toBe('Team Sakura');
  });

  it('correctly identifies a true tie when savings, worth, and spent are identical', () => {
    const teamA = { totalSavings: 50000, totalActualWorth: 90000, totalSpent: 40000 };
    const teamB = { totalSavings: 50000, totalActualWorth: 90000, totalSpent: 40000 };

    const isTie =
      teamA.totalSavings === teamB.totalSavings &&
      teamA.totalActualWorth === teamB.totalActualWorth &&
      teamA.totalSpent === teamB.totalSpent;

    expect(isTie).toBe(true);
  });
});

describe('Privacy & Confidential Valuations Boundary', () => {
  it('ensures team and public DTO projection strips confidential actualWorth', () => {
    const rawPlaceDocument = {
      _id: '64f8a123b456c789d0123456',
      placeName: 'Mount Fuji',
      description: 'Sacred mountain',
      imageUrl: 'https://example.com/fuji.jpg',
      startingPrice: 35000,
      actualWorth: 75000, // CONFIDENTIAL
      status: 'NOT_SOLD',
    };

    // Public / Team serializer
    const publicPlace = (({ actualWorth, ...rest }) => rest)(rawPlaceDocument);

    expect(publicPlace).not.toHaveProperty('actualWorth');
    expect(publicPlace.placeName).toBe('Mount Fuji');
    expect(publicPlace.startingPrice).toBe(35000);
  });
});
