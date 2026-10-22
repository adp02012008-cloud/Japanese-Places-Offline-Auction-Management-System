import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Place from '@/models/Place';
import AuditLog from '@/models/AuditLog';
import { requireAdmin, handleAuthError } from '@/lib/auth/rbac';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const place = await Place.findById(params.id).lean();
    if (!place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, place });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const place = await Place.findById(params.id);
    if (!place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { placeName, description, imageUrl, startingPrice, actualWorth, status } = body;

    const beforeState = {
      placeName: place.placeName,
      startingPrice: place.startingPrice,
      actualWorth: place.actualWorth,
      status: place.status,
    };

    if (placeName) place.placeName = placeName.trim();
    if (description) place.description = description.trim();
    if (imageUrl) place.imageUrl = imageUrl;

    if (startingPrice !== undefined) {
      const sp = Number(startingPrice);
      if (!isNaN(sp) && sp >= 0) place.startingPrice = sp;
    }

    if (actualWorth !== undefined) {
      const aw = Number(actualWorth);
      if (!isNaN(aw) && aw >= 0) place.actualWorth = aw;
    }

    if (status && ['NOT_SOLD', 'SOLD', 'WITHDRAWN'].includes(status)) {
      place.status = status;
    }

    await place.save();

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'PLACE_UPDATE',
      affectedRecordType: 'Place',
      affectedRecordId: place._id.toString(),
      beforeValue: beforeState,
      afterValue: {
        placeName: place.placeName,
        startingPrice: place.startingPrice,
        actualWorth: place.actualWorth,
        status: place.status,
      },
      reason: `Updated place: ${place.placeName}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, place });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = await requireAdmin();
    await connectToDatabase();

    const place = await Place.findById(params.id);
    if (!place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    if (place.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot withdraw or delete a place that has already been confirmed as sold.' },
        { status: 400 }
      );
    }

    place.status = 'WITHDRAWN';
    await place.save();

    await AuditLog.create({
      adminId: adminSession.userId,
      adminUsername: adminSession.username,
      actionType: 'PLACE_WITHDRAW',
      affectedRecordType: 'Place',
      affectedRecordId: place._id.toString(),
      beforeValue: { status: 'NOT_SOLD' },
      afterValue: { status: 'WITHDRAWN' },
      reason: `Withdrawn place ${place.placeName} from auction`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Place marked as withdrawn.' });
  } catch (err) {
    return handleAuthError(err);
  }
}
