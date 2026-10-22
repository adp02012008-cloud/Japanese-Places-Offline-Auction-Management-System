import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    let { data: settings } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();

    if (!settings) {
      const { data: created } = await supabase
        .from('event_settings')
        .insert({
          event_name: 'Japanese Places Offline Auction 2026',
          starting_budget_per_team: 100000,
          currency: '₹',
          active_winning_rule: 'SAVINGS',
          is_registration_open: true,
          require_admin_approval: true,
          is_announcement_public: false,
        })
        .select()
        .single();
      settings = created;
    }

    return NextResponse.json({
      success: true,
      settings: {
        _id: String(settings?.id),
        eventName: settings?.event_name,
        startingBudgetPerTeam: Number(settings?.starting_budget_per_team),
        currency: settings?.currency,
        activeWinningRule: settings?.active_winning_rule,
        isRegistrationOpen: settings?.is_registration_open,
        requireAdminApproval: settings?.require_admin_approval,
        isAnnouncementPublic: settings?.is_announcement_public,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const body = await req.json();
    const { eventName, startingBudgetPerTeam, currency, activeWinningRule, isRegistrationOpen, requireAdminApproval } = body;

    let { data: settings } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (eventName) updates.event_name = eventName.trim();
    if (currency) updates.currency = currency.trim();
    if (activeWinningRule && ['SAVINGS', 'EFFICIENCY', 'ACTUAL_WORTH'].includes(activeWinningRule)) {
      updates.active_winning_rule = activeWinningRule;
    }
    if (typeof isRegistrationOpen === 'boolean') {
      updates.is_registration_open = isRegistrationOpen;
    }
    if (typeof requireAdminApproval === 'boolean') {
      updates.require_admin_approval = requireAdminApproval;
    }
    if (typeof startingBudgetPerTeam === 'number' && startingBudgetPerTeam >= 0) {
      updates.starting_budget_per_team = startingBudgetPerTeam;
    }

    let updatedSettings;
    if (settings) {
      const { data } = await supabase
        .from('event_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();
      updatedSettings = data;
    } else {
      const { data } = await supabase
        .from('event_settings')
        .insert(updates)
        .select()
        .single();
      updatedSettings = data;
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'EVENT_SETTINGS_UPDATE',
      affected_record_type: 'EventSettings',
      affected_record_id: String(updatedSettings?.id || 'default'),
      before_value: settings,
      after_value: updatedSettings,
      reason: 'Administrator updated event configuration settings',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      settings: {
        _id: String(updatedSettings?.id),
        eventName: updatedSettings?.event_name,
        startingBudgetPerTeam: Number(updatedSettings?.starting_budget_per_team),
        currency: updatedSettings?.currency,
        activeWinningRule: updatedSettings?.active_winning_rule,
        isRegistrationOpen: updatedSettings?.is_registration_open,
        requireAdminApproval: updatedSettings?.require_admin_approval,
        isAnnouncementPublic: updatedSettings?.is_announcement_public,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
