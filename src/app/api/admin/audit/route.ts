import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import AuditLog from '@/models/AuditLog';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return handleAuthError(err);
  }
}
