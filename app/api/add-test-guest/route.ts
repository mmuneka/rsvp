import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Create a test guest
    const testGuest = {
      id: Date.now().toString(),
      name: `Test Guest ${new Date().toLocaleTimeString()}`,
      email: 'test@example.com',
      phone: '07123456789',
      message: 'This is a test entry',
      qrCode: `TEST-QR-${Date.now()}`,
      checkedIn: false,
      rsvpDate: new Date().toISOString()
    };
    
    // File path for storing guest data
    const FILE_PATH = path.join(process.cwd(), 'public', 'list.txt');
    
    // Format the guest data as a CSV line
    const guestLine = [
      testGuest.name,
      testGuest.email,
      testGuest.phone || '',
      testGuest.message || '',
      testGuest.qrCode,
      testGuest.checkedIn ? 'Yes' : 'No',
      testGuest.checkedInAt || '',
      testGuest.rsvpDate
    ].join(', ');

    // Check if file exists, if not create it with header
    if (!fs.existsSync(FILE_PATH)) {
      const header = '# Wedding RSVP Guest List\n# Format: Name, Email, Phone, Message, QR Code, Check-in Status, Check-in Time, RSVP Date';
      fs.writeFileSync(FILE_PATH, header);
    }

    // Append to the file
    fs.appendFileSync(FILE_PATH, `\n${guestLine}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test guest added successfully',
      guest: testGuest
    });
  } catch (error: any) {
    console.error('Error adding test guest:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}