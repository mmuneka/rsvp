import { NextResponse } from 'next/server';
import { getGuestsCollection } from '@/lib/guest-model';

export async function GET() {
  try {
    // Get the MongoDB collection
    const collection = await getGuestsCollection();
    
    if (!collection) {
      // If we can't connect to MongoDB, return a default count
      return NextResponse.json({ count: 0 });
    }
    
    // Count the documents in the collection
    const count = await collection.countDocuments();
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting guest count from MongoDB:', error);
    return NextResponse.json({ count: 0 });
  }
}