// Google Sheets integration for wedding RSVP app
import { Guest } from './db';
import { SHEET_ID, SHEET_NAME } from './google-auth';

export async function saveGuestToSheet(guest: Guest): Promise<boolean> {
  try {
    // Format the data for the sheet
    const formattedData = [
      guest.name,
      guest.email,
      guest.phone,
      guest.message,
      guest.qrCode,
      guest.checkedIn ? 'Yes' : 'No',
      guest.checkedInAt || '',
      guest.rsvpDate
    ];

    console.log('Saving to Google Sheet:', formattedData);
    
    // Make API request to your server endpoint that will handle the Google Sheets API
    const response = await fetch('/api/save-rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guest: formattedData }),
    });

    const result = await response.json();
    console.log('Google Sheet API response:', result);
    
    if (!response.ok) {
      throw new Error(`Failed to save to Google Sheet: ${JSON.stringify(result)}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    return false;
  }
}