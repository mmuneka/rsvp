import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Sheet ID from the URL
const SHEET_ID = '1Nwq0sYISLJyUOts9vmbe2Q-kFayjd4pRkhtGoLBd5yE';
const SHEET_NAME = 'Guests';

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Google API credentials are missing',
        env: {
          GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
          GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY
        }
      });
    }
    
    // Initialize the Google Sheets API
    // Try to use the credentials file first, then fall back to environment variables
    let auth;
    try {
      // Using credentials file
      auth = new google.auth.GoogleAuth({
        keyFile: './google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (error) {
      console.log('Falling back to environment variables for auth');
      // Fall back to environment variables
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test by writing a test row
    const testData = ['Test', 'test@example.com', new Date().toISOString()];
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testData],
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test data written successfully',
      response: response.data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || {}
    }, { status: 500 });
  }
}