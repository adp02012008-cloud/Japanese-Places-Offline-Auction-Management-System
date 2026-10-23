import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = supabase.from('teams').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('team_name', `%${search}%`);
    }
    if (status && status !== 'ALL') {
      query = query.eq('approval_status', status);
    }

    const { data: teams, error } = await query;
    if (error) throw error;

    // Map to frontend interface
    const mappedTeams = (teams || []).map((t) => ({
      _id: String(t.id),
      teamName: t.team_name,
      memberCount: t.member_count,
      approvalStatus: t.approval_status,
      participationStatus: t.participation_status,
      startingBudget: Number(t.starting_budget),
      remainingBudget: Number(t.remaining_budget),
      totalSpent: Number(t.total_spent),
      totalActualWorth: Number(t.total_actual_worth),
      username: t.username,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({ success: true, teams: mappedTeams });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const body = await req.json();
    const { teamId, approvalStatus, participationStatus, startingBudget } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });
    }

    const { data: team, error: fetchErr } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (fetchErr || !team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (approvalStatus && ['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      updates.approval_status = approvalStatus;
    }

    if (participationStatus && ['ACTIVE', 'INACTIVE'].includes(participationStatus)) {
      updates.participation_status = participationStatus;
    }

    if (typeof startingBudget === 'number' && startingBudget >= 0) {
      const budgetDiff = startingBudget - Number(team.starting_budget);
      updates.starting_budget = startingBudget;
      updates.remaining_budget = Math.max(0, Number(team.remaining_budget) + budgetDiff);
    }

    const { data: updatedTeam, error: updateErr } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'TEAM_STATUS_UPDATE',
      affected_record_type: 'Team',
      affected_record_id: String(teamId),
      before_value: {
        approval_status: team.approval_status,
        participation_status: team.participation_status,
        starting_budget: team.starting_budget,
        remaining_budget: team.remaining_budget,
      },
      after_value: updates,
      reason: `Updated team status/budget for ${team.team_name}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      team: {
        _id: String(updatedTeam.id),
        teamName: updatedTeam.team_name,
        approvalStatus: updatedTeam.approval_status,
        participationStatus: updatedTeam.participation_status,
        startingBudget: Number(updatedTeam.starting_budget),
        remainingBudget: Number(updatedTeam.remaining_budget),
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const supabase = getSupabaseAdmin();

    const body = await req.json();
    const { teamName, startingBudget: customBudget, captainName } = body;

    const trimmedTeamName = (teamName || '').trim();
    if (!trimmedTeamName) {
      return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });
    }

    // Check if team name already exists
    const { data: existing } = await supabase
      .from('teams')
      .select('id, team_name')
      .ilike('team_name', trimmedTeamName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Team "${trimmedTeamName}" already exists.` }, { status: 400 });
    }

    // Get event default budget if not specified
    let startingBudget = Number(customBudget);
    if (!startingBudget || startingBudget <= 0) {
      const { data: settings } = await supabase
        .from('event_settings')
        .select('starting_budget_per_team')
        .limit(1)
        .maybeSingle();
      startingBudget = settings?.starting_budget_per_team ?? 100000;
    }

    const { hashPassword } = await import('@/lib/auth/session');
    const { generateTeamUsername } = await import('@/lib/utils');
    const defaultPassword = 'team123';
    const passwordHash = await hashPassword(defaultPassword);
    const username = generateTeamUsername(trimmedTeamName);

    const { data: newTeam, error: teamErr } = await supabase
      .from('teams')
      .insert({
        team_name: trimmedTeamName,
        member_count: 1,
        approval_status: 'APPROVED',
        participation_status: 'ACTIVE',
        starting_budget: startingBudget,
        remaining_budget: startingBudget,
        total_spent: 0,
        total_actual_worth: 0,
        username,
        password_hash: passwordHash,
        first_login_must_change_password: false,
      })
      .select()
      .single();

    if (teamErr || !newTeam) {
      return NextResponse.json({ error: teamErr?.message || 'Failed to create team.' }, { status: 500 });
    }

    // Add primary representative member
    const memberName = (captainName || '').trim() || `${trimmedTeamName} Representative`;
    const enrollment = `ENR-${trimmedTeamName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-01`;
    await supabase.from('team_members').insert({
      team_id: newTeam.id,
      full_name: memberName,
      enrollment_number: enrollment,
    });

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      admin_id: adminSession.userId,
      admin_username: adminSession.username,
      action_type: 'TEAM_CREATE_DIRECT',
      affected_record_type: 'Team',
      affected_record_id: String(newTeam.id),
      after_value: {
        team_name: newTeam.team_name,
        username: newTeam.username,
        starting_budget: newTeam.starting_budget,
      },
      reason: `Directly created team "${trimmedTeamName}" by admin`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      team: {
        _id: String(newTeam.id),
        teamName: newTeam.team_name,
        approvalStatus: newTeam.approval_status,
        participationStatus: newTeam.participation_status,
        startingBudget: Number(newTeam.starting_budget),
        remainingBudget: Number(newTeam.remaining_budget),
        totalSpent: 0,
        totalActualWorth: 0,
        username: newTeam.username,
        defaultPassword,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

