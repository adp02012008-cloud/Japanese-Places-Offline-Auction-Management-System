import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Place from '@/models/Place';
import AuditLog from '@/models/AuditLog';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const filter: Record<string, any> = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search) {
      filter.placeName = { $regex: search, $options: 'i' };
    }

    const places = await Place.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, places });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { placeName, description, imageUrl, imageStoragePath, startingPrice, actualWorth } = body;

    if (!placeName || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Place name, description, and image URL are required.' },
        { status: 400 }
      );
    }

    const startPriceNum = Number(startingPrice);
    const actualWorthNum = Number(actualWorth);

    if (isNaN(startPriceNum) || startPriceNum < 0) {
      return NextResponse.json({ error: 'Starting price must be a non-negative number.' }, { status: 400 });
    }

    if (isNaN(actualWorthNum) || actualWorthNum < 0) {
      return NextResponse.json({ error: 'Actual worth must be a non-negative number.' }, { status: 400 });
    }

    const trimmedName = placeName.trim();
    const existing = await Place.findOne({ placeName: trimmedName });
    if (existing) {
      return NextResponse.json(
        { error: `A Japanese place with the name "${trimmedName}" already exists.` },
        { status: 409 }
      );
    }

    const newPlace = await Place.create({
      placeName: trimmedName,
      description: description.trim(),
      imageUrl,
      imageStoragePath: imageStoragePath || '',
      startingPrice: startPriceNum,
      actualWorth: actualWorthNum,
      status: 'NOT_SOLD',
    });

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'PLACE_CREATION',
      affectedRecordType: 'Place',
      affectedRecordId: newPlace._id.toString(),
      afterValue: {
        placeName: newPlace.placeName,
        startingPrice: newPlace.startingPrice,
        actualWorth: newPlace.actualWorth,
      },
      reason: `Created new Japanese landmark: ${newPlace.placeName}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, place: newPlace });
  } catch (err) {
    return handleAuthError(err);
  }
}
