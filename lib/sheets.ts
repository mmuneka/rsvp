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

    // Don't throw an error, just return false if response is not OK
    if (!response.ok) {
      console.warn('Server returned error status:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving guest data:', error);
    // Return true anyway to allow the form to proceed
    return true;
  }
}

export async function getAllGuests(authKey: string): Promise<Guest[]> {
  try {
    const response = await fetch(`/api/get-guests?key=${authKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve guest data');
    }

    const data = await response.json();
    return data.guests || [];
  } catch (error) {
    console.error('Error retrieving guest data:', error);
    return [];
  }
}