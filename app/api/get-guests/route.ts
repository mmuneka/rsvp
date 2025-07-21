import { NextRequest, NextResponse } from 'next/server';
import { Guest } from '@/lib/db';
import { getAllGuests } from '@/lib/guest-model';

export async function GET(request: NextRequest) {
  try {
    // Check for authentication (simple password in query param for demo)
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    
    // Simple auth check - replace with a more secure method in production
    if (authKey !== process.env.ADMIN_KEY && authKey !== 'wedding-admin-key') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get guests from MongoDB
    const guests = await getAllGuests();

    return NextResponse.json({ success: true, guests });
  } catch (error) {
    console.error('Error getting guests:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}