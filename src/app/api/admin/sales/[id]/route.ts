import { NextRequest, NextResponse } from 'next/server';
import { cancelSale } from '@/lib/services/auctionService';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = await requireAdmin();
    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
      return NextResponse.json(
        { error: 'A valid reason (minimum 3 characters) is required to cancel a confirmed sale.' },
        { status: 400 }
      );
    }

    await cancelSale({
      purchaseId: params.id,
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      reason: reason.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Sale cancelled and team budget restored successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to cancel sale.' }, { status: 400 });
  }
}
