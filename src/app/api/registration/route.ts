import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';
import EventSettings from '@/models/EventSettings';
import { hashPassword } from '@/lib/auth/session';
import { generateTeamUsername } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { teamName, memberCount, members } = body;

    // 1. Check if event registration is open
    const settings = await EventSettings.findOne().lean();
    if (settings && settings.isRegistrationOpen === false) {
      return NextResponse.json(
        { error: 'Team registration is currently closed by the event administrator.' },
        { status: 403 }
      );
    }

    const startingBudget = settings?.startingBudgetPerTeam ?? 100000;
    const requireApproval = settings?.requireAdminApproval ?? true;

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
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${trimmedTeamName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
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
          { error: `Duplicate enrollment number "${cleanEnroll}" found within the team submission.` },
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
    const existingMember = await TeamMember.findOne({
      enrollmentNumber: { $in: Array.from(submissionEnrollments) },
    }).lean();

    if (existingMember) {
      return NextResponse.json(
        {
          error: `Enrollment number "${existingMember.enrollmentNumber}" is already registered by another team in this event.`,
        },
        { status: 409 }
      );
    }

    // 6. Generate Team Account Credentials
    const generatedUsername = generateTeamUsername(trimmedTeamName);
    const tempPassword = 'Team@' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const passwordHash = await hashPassword(tempPassword);

    // 7. Save Team document
    const newTeam = await Team.create({
      teamName: trimmedTeamName,
      memberCount: parsedCount,
      approvalStatus: requireApproval ? 'PENDING' : 'APPROVED',
      participationStatus: 'ACTIVE',
      startingBudget,
      remainingBudget: startingBudget,
      totalSpent: 0,
      totalActualWorth: 0,
      username: generatedUsername,
      passwordHash,
      firstLoginMustChangePassword: true,
    });

    // 8. Save Team Members
    const memberDocs = cleanMembers.map((m) => ({
      teamId: newTeam._id,
      fullName: m.fullName,
      enrollmentNumber: m.enrollmentNumber,
    }));
    await TeamMember.insertMany(memberDocs);

    return NextResponse.json({
      success: true,
      teamId: newTeam._id.toString(),
      teamName: newTeam.teamName,
      approvalStatus: newTeam.approvalStatus,
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
    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'A duplicate team name or enrollment number already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Server error processing registration.' }, { status: 500 });
  }
}
