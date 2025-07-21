import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Guest } from '@/lib/db';

const DATA_FILE = path.join(process.cwd(), 'data', 'guests.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read existing guests
const readGuests = (): Guest[] => {
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading guests file:', error);
    return [];
  }
};

// Write guests to file
const writeGuests = (guests: Guest[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(guests, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing guests file:', error);
    return false;
  }
};

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
    const guests = readGuests();
    const duplicateEmail = guests.find(g => g.email.toLowerCase() === guest.email.toLowerCase());
    const duplicatePhone = guest.phone ? guests.find(g => 
      g.phone && g.phone.replace(/\s+/g, '') === guest.phone.replace(/\s+/g, '')
    ) : null;

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

    // Add guest to list and save
    guests.push(guest);
    const saved = writeGuests(guests);

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