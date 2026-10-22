import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const mapped = (logs || []).map((l) => ({
      _id: String(l.id),
      adminId: l.admin_id,
      adminUsername: l.admin_username,
      actionType: l.action_type,
      affectedRecordType: l.affected_record_type,
      affectedRecordId: l.affected_record_id,
      beforeValue: l.before_value,
      afterValue: l.after_value,
      reason: l.reason,
      timestamp: l.timestamp,
    }));

    return NextResponse.json({ success: true, logs: mapped });
  } catch (err) {
    return handleAuthError(err);
  }
}
