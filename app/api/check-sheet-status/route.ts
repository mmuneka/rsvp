import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth, SHEET_ID, SHEET_NAME } from '@/lib/google-auth';

export async function GET() {
  try {
    // Get Google auth client
    const auth = await getGoogleAuth();
    const authMethod = 'file';

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to get sheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    return NextResponse.json({ 
      success: true, 
      authMethod,
      sheetTitle: response.data.properties?.title,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
      sheets: response.data.sheets?.map(sheet => sheet.properties?.title)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || {}
    }, { status: 500 });
  }
}