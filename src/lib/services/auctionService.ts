import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
 * Confirms an offline sale in Supabase.
 * Checks availability, budget adequacy, records purchase, updates landmark, and logs audit trail.
 */
export async function confirmOfflineSale({
  placeId,
  teamId,
  finalPurchasePrice,
  adminId,
  adminUsername,
  notes = '',
}: ConfirmSaleParams) {
  const supabase = getSupabaseAdmin();

  if (typeof finalPurchasePrice !== 'number' || finalPurchasePrice < 0 || isNaN(finalPurchasePrice)) {
    throw new Error('Invalid purchase price. Amount must be a non-negative number.');
  }

  // 1. Fetch place
  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('*')
    .eq('id', placeId)
    .single();

  if (placeError || !place) {
    throw new Error(`Japanese place with ID "${placeId}" does not exist.`);
  }

  if (place.status === 'SOLD') {
    throw new Error(`Place "${place.place_name}" has already been sold and cannot be re-purchased.`);
  }

  if (place.status === 'WITHDRAWN') {
    throw new Error(`Place "${place.place_name}" is currently withdrawn from the auction.`);
  }

  // 2. Fetch winning team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (teamError || !team) {
    throw new Error(`Team with ID "${teamId}" does not exist.`);
  }

  if (team.approval_status !== 'APPROVED') {
    throw new Error(`Team "${team.team_name}" is not approved for participation.`);
  }

  if (team.participation_status !== 'ACTIVE') {
    throw new Error(`Team "${team.team_name}" is marked as inactive.`);
  }

  // 3. Verify sufficient budget
  const remainingBudget = Number(team.remaining_budget);
  if (remainingBudget < finalPurchasePrice) {
    throw new Error(
      `Insufficient budget! Team "${team.team_name}" has remaining balance of ${remainingBudget}, but purchase price is ${finalPurchasePrice}.`
    );
  }

  // 4. Create confirmed purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      place_id: place.id,
      place_name: place.place_name,
      team_id: team.id,
      team_name: team.team_name,
      final_purchase_price: finalPurchasePrice,
      actual_worth_at_sale: place.actual_worth,
      status: 'CONFIRMED',
      confirmed_at: new Date().toISOString(),
      admin_id: adminId,
      admin_username: adminUsername,
      notes,
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    throw new Error(`Failed to record purchase: ${purchaseError?.message || 'Database error'}`);
  }

  // 5. Update Place state
  const { error: updatePlaceError } = await supabase
    .from('places')
    .update({
      status: 'SOLD',
      winning_team_id: team.id,
      winning_team_name: team.team_name,
      final_purchase_price: finalPurchasePrice,
      sold_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', place.id);

  if (updatePlaceError) {
    // Rollback purchase record if place update fails
    await supabase.from('purchases').delete().eq('id', purchase.id);
    throw new Error(`Failed to update place status: ${updatePlaceError.message}`);
  }

  // 6. Update Team budget & totals
  const newRemaining = Math.max(0, remainingBudget - finalPurchasePrice);
  const newSpent = Number(team.total_spent) + finalPurchasePrice;
  const newWorth = Number(team.total_actual_worth) + Number(place.actual_worth);

  await supabase
    .from('teams')
    .update({
      remaining_budget: newRemaining,
      total_spent: newSpent,
      total_actual_worth: newWorth,
      updated_at: new Date().toISOString(),
    })
    .eq('id', team.id);

  // 7. Audit log creation
  await supabase.from('audit_logs').insert({
    admin_id: adminId,
    admin_username: adminUsername,
    action_type: 'SALE_CONFIRMATION',
    affected_record_type: 'Purchase',
    affected_record_id: purchase.id,
    before_value: {
      place_status: 'NOT_SOLD',
      team_remaining_budget: remainingBudget,
      team_total_spent: team.total_spent,
    },
    after_value: {
      place_status: 'SOLD',
      final_purchase_price: finalPurchasePrice,
      winning_team_id: team.id,
      team_remaining_budget: newRemaining,
      team_total_spent: newSpent,
    },
    reason: `Offline auction sale confirmed for place: ${place.place_name}`,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    purchaseId: purchase.id,
    place: {
      _id: place.id,
      placeName: place.place_name,
      status: 'SOLD',
    },
    team: {
      _id: team.id,
      teamName: team.team_name,
      remainingBudget: newRemaining,
      totalSpent: newSpent,
    },
  };
}

/**
 * Cancels a previously confirmed sale and restores landmark & team budget in Supabase.
 */
export async function cancelSale({
  purchaseId,
  adminId,
  adminUsername,
  reason,
}: CancelSaleParams) {
  const supabase = getSupabaseAdmin();

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .single();

  if (purchaseError || !purchase) {
    throw new Error(`Purchase record "${purchaseId}" not found.`);
  }

  if (purchase.status === 'CANCELLED') {
    throw new Error(`Purchase is already cancelled.`);
  }

  // Mark purchase cancelled
  await supabase
    .from('purchases')
    .update({
      status: 'CANCELLED',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: adminUsername,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  // Restore place
  await supabase
    .from('places')
    .update({
      status: 'NOT_SOLD',
      winning_team_id: null,
      winning_team_name: '',
      final_purchase_price: null,
      sold_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase.place_id);

  // Restore team budget
  const { data: team } = await supabase.from('teams').select('*').eq('id', purchase.team_id).single();
  if (team) {
    const restoredRemaining = Number(team.remaining_budget) + Number(purchase.final_purchase_price);
    const restoredSpent = Math.max(0, Number(team.total_spent) - Number(purchase.final_purchase_price));
    const restoredWorth = Math.max(0, Number(team.total_actual_worth) - Number(purchase.actual_worth_at_sale));

    await supabase
      .from('teams')
      .update({
        remaining_budget: restoredRemaining,
        total_spent: restoredSpent,
        total_actual_worth: restoredWorth,
        updated_at: new Date().toISOString(),
      })
      .eq('id', team.id);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    admin_id: adminId,
    admin_username: adminUsername,
    action_type: 'SALE_CANCELLATION',
    affected_record_type: 'Purchase',
    affected_record_id: purchase.id,
    before_value: { status: 'CONFIRMED', price: purchase.final_purchase_price },
    after_value: { status: 'CANCELLED', reason },
    reason: `Sale cancelled: ${reason}`,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}
