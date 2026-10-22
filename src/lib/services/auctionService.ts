import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import Place from '@/models/Place';
import Team from '@/models/Team';
import Purchase from '@/models/Purchase';
import AuditLog from '@/models/AuditLog';

export interface ConfirmSaleParams {
  placeId: string;
  teamId: string;
  finalPurchasePrice: number;
  adminId: string;
  adminUsername: string;
  notes?: string;
}

export interface CancelSaleParams {
  purchaseId: string;
  adminId: string;
  adminUsername: string;
  reason: string;
}

/**
 * Confirms an offline sale atomically.
 * Updates Place, Team, creates Purchase record, and adds AuditLog.
 * Aborts cleanly on any failure or validation error.
 */
export async function confirmOfflineSale({
  placeId,
  teamId,
  finalPurchasePrice,
  adminId,
  adminUsername,
  notes = '',
}: ConfirmSaleParams) {
  await connectToDatabase();

  if (typeof finalPurchasePrice !== 'number' || finalPurchasePrice < 0 || isNaN(finalPurchasePrice)) {
    throw new Error('Invalid purchase price. Amount must be a non-negative number.');
  }

  const db = mongoose.connection;
  let session: mongoose.ClientSession | null = null;
  let useTransaction = false;

  try {
    session = await db.startSession();
    // Check if replica set supports transactions
    useTransaction = true;
    session.startTransaction();
  } catch (err) {
    // If running on a standalone mongo without replica set (e.g. dev), fallback to atomic updates
    useTransaction = false;
    session = null;
  }

  try {
    // 1. Verify place exists & is available
    const placeQuery = Place.findById(placeId);
    if (session) placeQuery.session(session);
    const place = await placeQuery;

    if (!place) {
      throw new Error(`Japanese place with ID "${placeId}" does not exist.`);
    }

    if (place.status === 'SOLD') {
      throw new Error(`Place "${place.placeName}" has already been sold and cannot be re-purchased.`);
    }

    if (place.status === 'WITHDRAWN') {
      throw new Error(`Place "${place.placeName}" is currently withdrawn from the auction.`);
    }

    // 2. Verify winning team exists & is eligible
    const teamQuery = Team.findById(teamId);
    if (session) teamQuery.session(session);
    const team = await teamQuery;

    if (!team) {
      throw new Error(`Team with ID "${teamId}" does not exist.`);
    }

    if (team.approvalStatus !== 'APPROVED') {
      throw new Error(`Team "${team.teamName}" is not approved for participation.`);
    }

    if (team.participationStatus !== 'ACTIVE') {
      throw new Error(`Team "${team.teamName}" is marked as inactive.`);
    }

    // 3. Verify sufficient remaining budget
    if (team.remainingBudget < finalPurchasePrice) {
      throw new Error(
        `Insufficient budget! Team "${team.teamName}" has remaining balance of ${team.remainingBudget}, but purchase price is ${finalPurchasePrice}.`
      );
    }

    // 4. Create confirmed purchase record
    const purchaseDocs = await Purchase.create(
      [
        {
          placeId: place._id,
          placeName: place.placeName,
          teamId: team._id,
          teamName: team.teamName,
          finalPurchasePrice,
          actualWorthAtSale: place.actualWorth,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          adminId,
          adminUsername,
          notes,
        },
      ],
      session ? { session } : {}
    );
    const purchase = purchaseDocs[0];

    // 5. Update Place state
    place.status = 'SOLD';
    place.winningTeamId = team._id as mongoose.Types.ObjectId;
    place.winningTeamName = team.teamName;
    place.finalPurchasePrice = finalPurchasePrice;
    place.soldAt = new Date();
    await place.save(session ? { session } : undefined);

    // 6. Update Team budget & acquired totals
    team.remainingBudget = Math.max(0, team.remainingBudget - finalPurchasePrice);
    team.totalSpent = team.totalSpent + finalPurchasePrice;
    team.totalActualWorth = team.totalActualWorth + place.actualWorth;
    await team.save(session ? { session } : undefined);

    // 7. Audit log creation
    await AuditLog.create(
      [
        {
          adminId,
          adminUsername,
          actionType: 'SALE_CONFIRMATION',
          affectedRecordType: 'Purchase',
          affectedRecordId: purchase._id.toString(),
          beforeValue: {
            placeStatus: 'NOT_SOLD',
            teamRemainingBudget: team.remainingBudget + finalPurchasePrice,
            teamTotalSpent: team.totalSpent - finalPurchasePrice,
          },
          afterValue: {
            placeStatus: 'SOLD',
            finalPurchasePrice,
            winningTeamId: team._id.toString(),
            teamRemainingBudget: team.remainingBudget,
            teamTotalSpent: team.totalSpent,
          },
          reason: `Offline auction sale confirmed for place: ${place.placeName}`,
          timestamp: new Date(),
        },
      ],
      session ? { session } : {}
    );

    // Commit transaction if active
    if (session && useTransaction) {
      await session.commitTransaction();
    }

    return {
      success: true,
      purchaseId: purchase._id.toString(),
      place: {
        _id: place._id.toString(),
        placeName: place.placeName,
        status: place.status,
      },
      team: {
        _id: team._id.toString(),
        teamName: team.teamName,
        remainingBudget: team.remainingBudget,
        totalSpent: team.totalSpent,
      },
    };
  } catch (err) {
    if (session && useTransaction) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

/**
 * Cancels a previously confirmed sale and restores Place & Team budget.
 */
export async function cancelSale({
  purchaseId,
  adminId,
  adminUsername,
  reason,
}: CancelSaleParams) {
  await connectToDatabase();

  const db = mongoose.connection;
  let session: mongoose.ClientSession | null = null;
  let useTransaction = false;

  try {
    session = await db.startSession();
    useTransaction = true;
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
    session = null;
  }

  try {
    const purchaseQuery = Purchase.findById(purchaseId);
    if (session) purchaseQuery.session(session);
    const purchase = await purchaseQuery;

    if (!purchase) {
      throw new Error(`Purchase record "${purchaseId}" not found.`);
    }

    if (purchase.status === 'CANCELLED') {
      throw new Error(`Purchase is already cancelled.`);
    }

    // Find place
    const placeQuery = Place.findById(purchase.placeId);
    if (session) placeQuery.session(session);
    const place = await placeQuery;

    // Find team
    const teamQuery = Team.findById(purchase.teamId);
    if (session) teamQuery.session(session);
    const team = await teamQuery;

    // Mark purchase cancelled
    purchase.status = 'CANCELLED';
    purchase.cancellationReason = reason;
    purchase.cancelledAt = new Date();
    purchase.cancelledBy = adminUsername;
    await purchase.save(session ? { session } : undefined);

    // Restore place if it is still associated
    if (place) {
      place.status = 'NOT_SOLD';
      place.winningTeamId = undefined;
      place.winningTeamName = '';
      place.finalPurchasePrice = undefined;
      place.soldAt = undefined;
      await place.save(session ? { session } : undefined);
    }

    // Restore team budget
    if (team) {
      team.remainingBudget = team.remainingBudget + purchase.finalPurchasePrice;
      team.totalSpent = Math.max(0, team.totalSpent - purchase.finalPurchasePrice);
      team.totalActualWorth = Math.max(0, team.totalActualWorth - purchase.actualWorthAtSale);
      await team.save(session ? { session } : undefined);
    }

    // Audit log
    await AuditLog.create(
      [
        {
          adminId,
          adminUsername,
          actionType: 'SALE_CANCELLATION',
          affectedRecordType: 'Purchase',
          affectedRecordId: purchase._id.toString(),
          beforeValue: { status: 'CONFIRMED', price: purchase.finalPurchasePrice },
          afterValue: { status: 'CANCELLED', reason },
          reason: `Sale cancelled: ${reason}`,
          timestamp: new Date(),
        },
      ],
      session ? { session } : {}
    );

    if (session && useTransaction) {
      await session.commitTransaction();
    }

    return { success: true };
  } catch (err) {
    if (session && useTransaction) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
