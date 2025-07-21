import { NextRequest, NextResponse } from 'next/server';
import { findGuestByQRCode, updateGuest } from '@/lib/guest-model';

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json();
    
    if (!qrCode) {
      return NextResponse.json(
        { success: false, message: 'QR code is required' },
        { status: 400 }
      );
    }

    // Find guest by QR code
    const guest = await findGuestByQRCode(qrCode);

    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Invalid QR code - Guest not found' },
        { status: 404 }
      );
    }

    if (guest.checkedIn) {
      return NextResponse.json({
        success: false,
        guest,
        message: `${guest.name} is already checked in at ${new Date(guest.checkedInAt!).toLocaleTimeString()}`,
      });
    }

    // Update guest check-in status
    const updatedGuest = await updateGuest(guest.id, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      message: `Welcome ${guest.name}! Successfully checked in ${guest.guests || '1'} guest(s)`,
    });
  } catch (error) {
    console.error('Error checking in guest:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}