import { NextRequest, NextResponse } from 'next/server';
import { Guest } from '@/lib/db';
import { saveGuest, findGuestByEmail, findGuestByPhone } from '@/lib/guest-model';

export async function POST(request: NextRequest) {
  try {
    const { guest } = await request.json();
    
    if (!guest || !guest.name || !guest.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid guest data' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicateEmail = await findGuestByEmail(guest.email);
    const duplicatePhone = guest.phone ? await findGuestByPhone(guest.phone) : null;

    if (duplicateEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    if (duplicatePhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Save guest to MongoDB
    const saved = await saveGuest(guest);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Failed to save guest data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Error saving guest:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}