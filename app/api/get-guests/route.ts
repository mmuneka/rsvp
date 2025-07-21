import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Guest } from '@/lib/db';

const DATA_FILE = path.join(process.cwd(), 'data', 'guests.json');

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

    // Read guests file
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ success: true, guests: [] });
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const guests: Guest[] = JSON.parse(data);

    return NextResponse.json({ success: true, guests });
  } catch (error) {
    console.error('Error getting guests:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}