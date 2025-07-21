import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    // Attempt to connect to MongoDB
    const client = await clientPromise;
    
    // Get the database
    const db = client.db('weddingrsvpDb');
    
    // Try a simple operation to verify connection
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to MongoDB!',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to MongoDB', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}