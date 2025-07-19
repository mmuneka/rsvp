// File-based storage for wedding RSVP app
import { Guest } from './db';

export async function saveGuestToSheet(guest: Guest): Promise<boolean> {
  try {
    // Save guest to file via API endpoint
    const response = await fetch('/api/save-guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guest }),
    });

    if (!response.ok) {
      throw new Error('Failed to save guest data');
    }

    return true;
  } catch (error) {
    console.error('Error saving guest data:', error);
    return false;
  }
}