import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Guest } from '@/lib/db';

// File path for storing guest data
const FILE_PATH = path.join(process.cwd(), 'public', 'list.txt');

export async function POST(request: Request) {
  try {
    const { guest } = await request.json();
    
    // Format the guest data as a CSV line
    const guestLine = [
      guest.name,
      guest.email,
      guest.phone || '',
      guest.message || '',
      guest.qrCode,
      guest.checkedIn ? 'Yes' : 'No',
      guest.checkedInAt || '',
      guest.rsvpDate
    ].join(', ');

    // Check if file exists, if not create it with header
    if (!fs.existsSync(FILE_PATH)) {
      const header = '# Wedding RSVP Guest List\n# Format: Name, Email, Phone, Message, QR Code, Check-in Status, Check-in Time, RSVP Date';
      fs.writeFileSync(FILE_PATH, header);
    }

    // Append to the file
    fs.appendFileSync(FILE_PATH, `\n${guestLine}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving guest data:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}