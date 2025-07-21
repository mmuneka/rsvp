// Simple global array to store guest names
export const guestNames = [];

// Function to add a guest
export function addGuestName(name, email, phone) {
  guestNames.push({ name, email, phone });
  console.log('Added guest:', name);
  console.log('Current guests:', guestNames);
}