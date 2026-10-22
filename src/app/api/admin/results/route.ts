import { NextResponse } from 'next/server';
import { calculateEventResults } from '@/lib/services/calculationEngine';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET() {
  try {
    await requireAdmin();
    const data = await calculateEventResults();
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return handleAuthError(err);
  }
}
