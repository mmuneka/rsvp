import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth, SHEET_ID, SHEET_NAME } from '@/lib/google-auth';

export async function GET() {
  try {
    // Get Google auth client
    const auth = await getGoogleAuth();

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Create test data
    const testData = [
      'Test User ' + new Date().toLocaleTimeString(),
      'test@example.com',
      '07123456789',
      'Test message',
      'TEST-QR-' + Date.now(),
      'No',
      '',
      new Date().toISOString()
    ];
    
    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testData],
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test entry added successfully',
      data: response.data
    });
  } catch (error: any) {
    console.error('Error adding test entry:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || {}
    }, { status: 500 });
  }
}