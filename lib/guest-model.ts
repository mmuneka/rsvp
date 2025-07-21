import clientPromise from './mongodb';
import { Guest } from './db';

export async function getGuestsCollection() {
  const client = await clientPromise;
  const db = client.db('wedding-rsvp');
  return db.collection<Guest>('guests');
}

export async function getAllGuests(): Promise<Guest[]> {
  try {
    const collection = await getGuestsCollection();
    return await collection.find({}).toArray();
  } catch (error) {
    console.error('Error getting guests from MongoDB:', error);
    return [];
  }
}

export async function saveGuest(guest: Guest): Promise<boolean> {
  try {
    const collection = await getGuestsCollection();
    await collection.insertOne(guest);
    return true;
  } catch (error) {
    console.error('Error saving guest to MongoDB:', error);
    return false;
  }
}

export async function updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | null> {
  try {
    const collection = await getGuestsCollection();
    await collection.updateOne({ id }, { $set: updates });
    return await collection.findOne({ id });
  } catch (error) {
    console.error('Error updating guest in MongoDB:', error);
    return null;
  }
}

export async function findGuestByQRCode(qrCode: string): Promise<Guest | null> {
  try {
    const collection = await getGuestsCollection();
    return await collection.findOne({ qrCode });
  } catch (error) {
    console.error('Error finding guest by QR code in MongoDB:', error);
    return null;
  }
}

export async function findGuestByEmail(email: string): Promise<Guest | null> {
  try {
    const collection = await getGuestsCollection();
    return await collection.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  } catch (error) {
    console.error('Error finding guest by email in MongoDB:', error);
    return null;
  }
}

export async function findGuestByPhone(phone: string): Promise<Guest | null> {
  try {
    const collection = await getGuestsCollection();
    // Remove spaces for comparison
    const cleanPhone = phone.replace(/\s+/g, '');
    // Find guests and process them to compare cleaned phone numbers
    const guests = await collection.find({ phone: { $exists: true } }).toArray();
    return guests.find(g => g.phone?.replace(/\s+/g, '') === cleanPhone) || null;
  } catch (error) {
    console.error('Error finding guest by phone in MongoDB:', error);
    return null;
  }
}