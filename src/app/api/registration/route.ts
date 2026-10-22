import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth/session';
import { generateTeamUsername } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { teamName, memberCount, members } = body;

    // 1. Check if event registration is open
    const { data: settings } = await supabase.from('event_settings').select('*').limit(1).single();

    if (settings && settings.is_registration_open === false) {
      return NextResponse.json(
        { error: 'Team registration is currently closed by the event administrator.' },
        { status: 403 }
      );
    }

    const startingBudget = Number(settings?.starting_budget_per_team ?? 100000);
    const requireApproval = settings?.require_admin_approval ?? true;

    // 2. Validate team fields
    if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Team name is required and must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const parsedCount = parseInt(memberCount, 10);
    if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 10) {
      return NextResponse.json(
        { error: 'Member count must be between 1 and 10 members.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(members) || members.length !== parsedCount) {
      return NextResponse.json(
        { error: `Please provide details for exactly ${parsedCount} team members.` },
        { status: 400 }
      );
    }

    const trimmedTeamName = teamName.trim();

    // 3. Case-insensitive duplicate team name check
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .ilike('team_name', trimmedTeamName)
      .maybeSingle();

    if (existingTeam) {
      return NextResponse.json(
        { error: `The team name "${trimmedTeamName}" is already taken. Please choose another name.` },
        { status: 409 }
      );
    }

    // 4. Validate member fields & uniqueness within submission
    const cleanMembers: Array<{ fullName: string; enrollmentNumber: string }> = [];
    const submissionEnrollments = new Set<string>();

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || typeof m.fullName !== 'string' || m.fullName.trim().length < 2) {
        return NextResponse.json(
          { error: `Member #${i + 1} full name is required (minimum 2 characters).` },
          { status: 400 }
        );
      }
      if (!m.enrollmentNumber || typeof m.enrollmentNumber !== 'string' || m.enrollmentNumber.trim().length < 2) {
        return NextResponse.json(
          { error: `Member #${i + 1} enrollment number is required.` },
          { status: 400 }
        );
      }

      const cleanEnroll = m.enrollmentNumber.trim().toUpperCase();
      if (submissionEnrollments.has(cleanEnroll)) {
        return NextResponse.json(
          { error: `Duplicate enrollment number "${cleanEnroll}" entered for multiple members.` },
          { status: 400 }
        );
      }
      submissionEnrollments.add(cleanEnroll);

      cleanMembers.push({
        fullName: m.fullName.trim(),
        enrollmentNumber: cleanEnroll,
      });
    }

    // 5. Global duplicate enrollment check across database
    const { data: existingMembers } = await supabase
      .from('team_members')
      .select('enrollment_number')
      .in('enrollment_number', Array.from(submissionEnrollments))
      .limit(1);

    if (existingMembers && existingMembers.length > 0) {
      return NextResponse.json(
        {
          error: `Enrollment number "${existingMembers[0].enrollment_number}" is already registered by another team in this event.`,
        },
        { status: 409 }
      );
    }

    // 6. Generate Team Account Credentials
    const generatedUsername = generateTeamUsername(trimmedTeamName);
    const tempPassword = 'Team@' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const passwordHash = await hashPassword(tempPassword);

    // 7. Save Team document in Supabase
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({
        team_name: trimmedTeamName,
        member_count: parsedCount,
        approval_status: requireApproval ? 'PENDING' : 'APPROVED',
        participation_status: 'ACTIVE',
        starting_budget: startingBudget,
        remaining_budget: startingBudget,
        total_spent: 0,
        total_actual_worth: 0,
        username: generatedUsername,
        password_hash: passwordHash,
        first_login_must_change_password: true,
      })
      .select()
      .single();

    if (teamError || !newTeam) {
      throw new Error(`Failed to create team: ${teamError?.message}`);
    }

    // 8. Save Team Members
    const memberRows = cleanMembers.map((m) => ({
      team_id: newTeam.id,
      full_name: m.fullName,
      enrollment_number: m.enrollmentNumber,
    }));

    const { error: membersError } = await supabase.from('team_members').insert(memberRows);
    if (membersError) {
      await supabase.from('teams').delete().eq('id', newTeam.id);
      throw new Error(`Failed to save members: ${membersError.message}`);
    }

    return NextResponse.json({
      success: true,
      teamId: String(newTeam.id),
      teamName: newTeam.team_name,
      approvalStatus: newTeam.approval_status,
      credentials: {
        username: generatedUsername,
        temporaryPassword: tempPassword,
      },
      message: requireApproval
        ? 'Registration submitted successfully! Your team is pending administrator approval.'
        : 'Registration confirmed! You can now log into your team dashboard.',
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: err.message || 'Server error processing registration.' }, { status: 500 });
  }
}
