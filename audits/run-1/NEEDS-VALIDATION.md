# Needs Validation — Unresolved Security Leads

The following lead has source-grounded indicators of a potential vulnerability but is blocked by operational deployment factors that cannot be confirmed solely through static source review. Per audit standards, no severity is assigned until validated.

---

## FPT-AUCTION-RACE-001: Non-Atomic Budget Check in Offline Sale Confirmation

- **Boundary**: Administrator Sale Confirmation to Team Budget Store
- **Affected Subsystem**: `src/lib/services/auctionService.ts`

### Source Trace & Evidence
1. **Entrypoint**: `src/lib/services/auctionService.ts:23` — `confirmOfflineSale` handler begins execution.
2. **Propagation**: `src/lib/services/auctionService.ts:76-81` —
   ```typescript
   const remainingBudget = Number(team.remaining_budget);
   if (remainingBudget < finalPurchasePrice) {
     throw new Error(`Insufficient budget! Team "${team.team_name}" has remaining balance...`);
   }
   ```
3. **Sink**: `src/lib/services/auctionService.ts:131-139` —
   ```typescript
   await supabase.from('teams').update({
     remaining_budget: newRemaining,
     total_spent: newSpent,
     total_actual_worth: newWorth,
   }).eq('id', team.id);
   ```

### Decisive Blocker
In an offline live auction event, a single human auctioneer typically controls the admin auction console. If only one operator is present and automated bots are not permitted to confirm sales, sequential check-then-act execution may not trigger race conditions in practice. However, if multiple administrators operate the auction desk concurrently or double-submit API requests, non-atomic updates could allow a team's balance to be overdrawn.

### Safe Verification Plan
1. **Local Test**: Write a concurrency test script that issues two simultaneous `POST /api/admin/sales` calls for the same team with prices exceeding the team's single-lot budget. Observe if both succeed and drive remaining balance below zero.
2. **Deployment Check**: Inspect production PostgreSQL table constraints in Supabase to determine whether `CHECK (remaining_budget >= 0)` is active on `public.teams`.

### Recommended Hardening
Add an atomic check constraint and transaction in `supabase/schema.sql`:
```sql
ALTER TABLE public.teams ADD CONSTRAINT check_non_negative_budget CHECK (remaining_budget >= 0.00);
```
Wrap purchase insertion and team budget deduction in an atomic PostgreSQL stored procedure (`rpc`) or transaction.
