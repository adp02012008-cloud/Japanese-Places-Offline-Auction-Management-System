import { NextResponse } from 'next/server';
import { clearSessionCookie, getCurrentSession } from '@/lib/auth/session';

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully.' });
}
