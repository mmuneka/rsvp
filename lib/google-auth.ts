import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Google Sheet ID from the URL
export const SHEET_ID = '1Nwq0sYISLJyUOts9vmbe2Q-kFayjd4pRkhtGoLBd5yE';
export const SHEET_NAME = 'Guests';

export async function getGoogleAuth() {
  try {
    // Try to read the credentials file
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      // Use the credentials file directly with keyFile option
      return new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {
      throw new Error('Credentials file not found');
    }
  } catch (error) {
    console.error('Error setting up Google auth:', error);
    throw error;
  }
}