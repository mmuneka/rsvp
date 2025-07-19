import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth, SHEET_ID, SHEET_NAME } from '@/lib/google-auth';

export async function POST(request: Request) {
  try {
    const { guest } = await request.json();
    console.log('Received guest data:', guest);
    
    // Get Google auth client
    const auth = await getGoogleAuth();

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Attempting to append to sheet:', SHEET_ID, SHEET_NAME);
    
    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [guest],
      },
    });

    console.log('Google Sheets API response:', response.data);
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Error saving to Google Sheet:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save to Google Sheet',
        details: error.response?.data || {}
      },
      { status: 500 }
    );
  }
}