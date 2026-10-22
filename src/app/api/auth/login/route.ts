import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Admin from '@/models/Admin';
import Team from '@/models/Team';
import { verifyPassword, hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { AuthSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, password, type } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check if initial admin needs creation
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
      const defaultPass = process.env.ADMIN_PASSWORD || 'Admin@Sakura2026!';
      const defaultHash = await hashPassword(defaultPass);
      await Admin.create({
        username: defaultUser,
        passwordHash: defaultHash,
        role: 'ADMIN',
      });
    }

    // 1. Check Admin login
    if (type === 'admin' || !type) {
      const admin = await Admin.findOne({ username: cleanUsername }).select('+passwordHash');
      if (admin) {
        const isMatch = await verifyPassword(password, admin.passwordHash);
        if (isMatch) {
          admin.lastLogin = new Date();
          await admin.save();

          const sessionPayload: AuthSession = {
            userId: admin._id.toString(),
            username: admin.username,
            role: 'ADMIN',
          };
          const token = await createSessionToken(sessionPayload);
          setSessionCookie(token);

          return NextResponse.json({
            success: true,
            user: sessionPayload,
          });
        }
      }
    }

    // 2. Check Team login
    const team = await Team.findOne({ username: cleanUsername }).select('+passwordHash');
    if (team && team.passwordHash) {
      const isMatch = await verifyPassword(password, team.passwordHash);
      if (isMatch) {
        if (team.participationStatus !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Team participation is currently disabled.' },
            { status: 403 }
          );
        }

        const sessionPayload: AuthSession = {
          userId: team._id.toString(),
          username: team.username,
          role: 'TEAM',
          teamId: team._id.toString(),
          teamName: team.teamName,
        };
        const token = await createSessionToken(sessionPayload);
        setSessionCookie(token);

        return NextResponse.json({
          success: true,
          user: sessionPayload,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid credentials. Please verify your login details.' }, { status: 401 });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred during authentication.' }, { status: 500 });
  }
}
