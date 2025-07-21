/**
 * Simple in-memory storage for wedding guests
 * This provides a fallback when localStorage and file storage fail
 */

import { Guest } from './db';

// In-memory storage for guests
export class MemoryStore {
  private static guests: Guest[] = [];

  static getGuests(): Guest[] {
    return [...this.guests];
  }

  static addGuest(guest: Guest): void {
    this.guests.push(guest);
  }

  static updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const index = this.guests.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    this.guests[index] = { ...this.guests[index], ...updates };
    return this.guests[index];
  }

  static findGuestByQRCode(qrCode: string): Guest | null {
    return this.guests.find(g => g.qrCode === qrCode) || null;
  }
}