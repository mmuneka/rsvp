// Simple global array to store guest names
export const guestNames = [];

// Maximum number of guests allowed
export const MAX_GUESTS = 80;

// Function to add a guest
export function addGuestName(name, email, phone) {
  guestNames.push({ name, email, phone });
  console.log('Added guest:', name);
  console.log('Current guests:', guestNames.length);
}

// Function to get current guest count
export function getCurrentGuestCount() {
  return guestNames.length;
}