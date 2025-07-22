import { NextRequest, NextResponse } from 'next/server';
import { getAllGuests } from '@/lib/guest-model';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if the auth header exists and matches the admin key
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all guests from MongoDB
    const guests = await getAllGuests();
    
    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error fetching MongoDB guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}