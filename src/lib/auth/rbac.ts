import { NextResponse } from 'next/server';
import { getCurrentSession } from './session';
import { AuthSession } from '@/types';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Asserts that the current request has an authenticated Administrator session.
 * Throws AuthError if unauthenticated or not an admin.
 */
export async function requireAdmin(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthError('Authentication required. Please log in as an administrator.', 401);
  }
  if (session.role !== 'ADMIN') {
    throw new AuthError('Access denied. Administrator privileges required.', 403);
  }
  return session;
}

/**
 * Asserts that the current request has an authenticated Team session.
 * Returns the session containing teamId.
 */
export async function requireTeam(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthError('Authentication required. Please log in with your team credentials.', 401);
  }
  if (session.role !== 'TEAM' || !session.teamId) {
    throw new AuthError('Access denied. Team account required.', 403);
  }
  return session;
}

/**
 * Asserts that the session belongs to either an Admin OR the specific Team requested.
 * Prevents Team A from accessing Team B's private financials.
 */
export async function requireTeamOrAdmin(targetTeamId: string): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthError('Authentication required.', 401);
  }
  if (session.role === 'ADMIN') {
    return session;
  }
  if (session.role === 'TEAM' && session.teamId === targetTeamId) {
    return session;
  }
  throw new AuthError('Access denied. You can only view your own team data.', 403);
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error('Unhandled Server Error:', error);
  return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
}
