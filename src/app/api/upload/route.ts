import { NextRequest, NextResponse } from 'next/server';
import { uploadPlaceImage } from '@/lib/services/storageService';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadPlaceImage(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      publicUrl: result.publicUrl,
      storagePath: result.storagePath,
    });
  } catch (err: any) {
    return handleAuthError(err);
  }
}
