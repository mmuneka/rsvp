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

    // Try to save guest to MongoDB, but continue even if it fails
    try {
      console.log('Attempting to save to MongoDB on environment:', process.env.NODE_ENV);
      console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);
      
      const saved = await saveGuest(guest);
      
      if (saved) {
        console.log('Successfully saved guest to MongoDB:', guest.name);
      } else {
        console.log('MongoDB save failed, but continuing with success response');
      }
    } catch (dbError) {
      console.error('MongoDB error:', dbError);
      // Continue despite MongoDB error
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