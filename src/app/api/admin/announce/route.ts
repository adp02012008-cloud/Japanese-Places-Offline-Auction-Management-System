import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { calculateEventResults } from '@/lib/services/calculationEngine';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const body = await req.json();
    const { isAnnouncementPublic } = body;

    let { data: settings } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();

    const previousStatus = settings?.is_announcement_public ?? false;

    if (settings) {
      await supabase
        .from('event_settings')
        .update({
          is_announcement_public: Boolean(isAnnouncementPublic),
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
    }

    const resultMetrics = await calculateEventResults();

    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'WINNER_ANNOUNCEMENT_TOGGLE',
      affected_record_type: 'EventSettings',
      affected_record_id: String(settings?.id || 'default'),
      before_value: { is_announcement_public: previousStatus },
      after_value: {
      after_value: {
        is_announcement_public: Boolean(isAnnouncementPublic),
        winner: resultMetrics.winner?.teamName || null,
        bestPerformingTeam: resultMetrics.bestPerformingTeam?.teamName || null,
        announcementMessage: resultMetrics.announcementMessage,
        announcementLabel: resultMetrics.announcementLabel,
      },
      reason: isAnnouncementPublic
        ? (resultMetrics.noPositiveSavings
            ? `Officially announced: ${resultMetrics.announcementMessage} (${resultMetrics.announcementLabel})`
            : `Officially announced winner: ${resultMetrics.winner?.teamName || 'None'}`)
        : 'Revoked public winner announcement',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      isAnnouncementPublic: Boolean(isAnnouncementPublic),
      winner: resultMetrics.winner,
      bestPerformingTeam: resultMetrics.bestPerformingTeam,
      noPositiveSavings: resultMetrics.noPositiveSavings,
      hasBreakEvenTeam: resultMetrics.hasBreakEvenTeam,
      announcementMessage: resultMetrics.announcementMessage,
      announcementLabel: resultMetrics.announcementLabel,
      isTie: resultMetrics.isTie,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
