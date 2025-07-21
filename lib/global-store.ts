// Simple global store for wedding guests
// This will persist during the application lifecycle but will reset on server restart

interface GuestEntry {
  name: string;
  email: string;
  phone: string;
  qrCode: string;
}

// Global array to store guest data
export const guestStore: GuestEntry[] = [];

export const addGuest = (guest: GuestEntry): void => {
  guestStore.push(guest);
};

export const getAllGuests = (): GuestEntry[] => {
  return [...guestStore];
};

export const findGuestByEmail = (email: string): GuestEntry | undefined => {
  return guestStore.find(g => g.email.toLowerCase() === email.toLowerCase());
};

export const findGuestByPhone = (phone: string): GuestEntry | undefined => {
  return guestStore.find(g => g.phone && g.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
};