import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyPassword, hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { AuthSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { username, password, type } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // 1. Check/initialize admin account if table is empty
    const { count } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    if (!count || count === 0) {
      const defaultUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
      const defaultPass = process.env.ADMIN_PASSWORD || 'Admin@Sakura2026!';
      const defaultHash = await hashPassword(defaultPass);
      await supabase.from('admins').insert({
        username: defaultUser,
        password_hash: defaultHash,
        role: 'ADMIN',
      });
    }

    // 2. Check Admin login
    if (type === 'admin' || !type) {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (admin && admin.password_hash) {
        const isMatch = await verifyPassword(password, admin.password_hash);
        if (isMatch) {
          await supabase
            .from('admins')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id);

          const sessionPayload: AuthSession = {
            userId: String(admin.id),
            username: admin.username,
            role: 'ADMIN',
          };
          const token = await createSessionToken(sessionPayload);
          setSessionCookie(token);

          return NextResponse.json({ success: true, user: sessionPayload });
        }
      }
    }

    // 3. Check Team login
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (team && team.password_hash) {
      const isMatch = await verifyPassword(password, team.password_hash);
      if (isMatch) {
        if (team.participation_status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Team participation is currently disabled.' },
            { status: 403 }
          );
        }

        const sessionPayload: AuthSession = {
          userId: String(team.id),
          username: team.username,
          role: 'TEAM',
          teamId: String(team.id),
          teamName: team.team_name,
        };
        const token = await createSessionToken(sessionPayload);
        setSessionCookie(token);

        return NextResponse.json({ success: true, user: sessionPayload });
      }
    }

    return NextResponse.json({ error: 'Invalid credentials. Please verify your login details.' }, { status: 401 });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred during authentication.' }, { status: 500 });
  }
}
