import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File path for storing guest data
const FILE_PATH = path.join(process.cwd(), 'public', 'list.txt');

export async function GET() {
  try {
    // Check if file exists
    if (!fs.existsSync(FILE_PATH)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Guest list file not found' 
      }, { status: 404 });
    }

    // Read the file
    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    
    // Parse the content (skip comments and empty lines)
    const lines = fileContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'));
    
    // Parse each line into a guest object
    const guests = lines.map(line => {
      const [name, email, phone, message, qrCode, checkedIn, checkedInAt, rsvpDate] = line.split(',').map(item => item.trim());
      
      return {
        name,
        email,
        phone,
        message,
        qrCode,
        checkedIn: checkedIn === 'Yes',
        checkedInAt,
        rsvpDate
      };
    });

    return NextResponse.json({ 
      success: true, 
      guests,
      count: guests.length
    });
  } catch (error: any) {
    console.error('Error reading guest list:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}