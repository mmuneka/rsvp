"use client"

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  guests?: string
  dietaryRestrictions?: string
  message: string
  qrCode: string
  checkedIn: boolean
  checkedInAt?: string
  rsvpDate: string
}

const DB_KEY = "wedding_guests_db"

export class SimpleDB {
  static getAllGuests(): Guest[] {
    if (typeof window === "undefined") return []

    try {
      const data = localStorage.getItem(DB_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error reading from database:", error)
      return []
    }
  }
  
  // Sync with server data (for admin use)
  static async syncWithServer(authKey: string): Promise<Guest[]> {
    if (typeof window === "undefined") return []
    
    try {
      // Import dynamically to avoid server-side issues
      const { getAllGuests } = await import('./sheets')
      const serverGuests = await getAllGuests(authKey)
      
      if (serverGuests && serverGuests.length > 0) {
        // Merge with local data, preferring server data for duplicates
        const localGuests = this.getAllGuests()
        const mergedGuests = [...serverGuests]
        
        // Add local guests that aren't on the server (by email)
        localGuests.forEach(localGuest => {
          const exists = serverGuests.some(serverGuest => 
            serverGuest.email.toLowerCase() === localGuest.email.toLowerCase()
          )
          if (!exists) {
            mergedGuests.push(localGuest)
          }
        })
        
        // Save merged data locally
        this.saveAllGuests(mergedGuests)
        return mergedGuests
      }
      
      return this.getAllGuests()
    } catch (error) {
      console.error("Error syncing with server:", error)
      return this.getAllGuests()
    }
  }

  static saveGuest(guest: Omit<Guest, "id" | "checkedIn" | "rsvpDate">): Guest {
    const guests = this.getAllGuests()
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString(),
      checkedIn: false,
      rsvpDate: new Date().toISOString(),
      guests: "1", // Default to 1 guest since we removed the field
    }

    guests.push(newGuest)
    this.saveAllGuests(guests)
    return newGuest
  }

  static updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const guests = this.getAllGuests()
    const index = guests.findIndex((g) => g.id === id)

    if (index === -1) return null

    guests[index] = { ...guests[index], ...updates }
    this.saveAllGuests(guests)
    return guests[index]
  }

  static findGuestByQRCode(qrCode: string): Guest | null {
    const guests = this.getAllGuests()
    return guests.find((g) => g.qrCode === qrCode) || null
  }

  static checkInGuest(qrCode: string): { success: boolean; guest?: Guest; message: string } {
    const guest = this.findGuestByQRCode(qrCode)

    if (!guest) {
      return { success: false, message: "Invalid QR code - Guest not found" }
    }

    if (guest.checkedIn) {
      return {
        success: false,
        guest,
        message: `${guest.name} is already checked in at ${new Date(guest.checkedInAt!).toLocaleTimeString()}`,
      }
    }

    const updatedGuest = this.updateGuest(guest.id, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    })

    return {
      success: true,
      guest: updatedGuest!,
      message: `Welcome ${guest.name}! Successfully checked in ${guest.guests || '1'} guest(s)`,
    }
  }

  private static saveAllGuests(guests: Guest[]): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(guests))
    } catch (error) {
      console.error("Error saving to database:", error)
    }
  }

  static exportToText(): string {
    const guests = this.getAllGuests()
    const lines = ["Wedding Guest Database Export", `Generated: ${new Date().toLocaleString()}`, "=".repeat(50), ""]

    guests.forEach((guest) => {
      lines.push(`Name: ${guest.name}`)
      lines.push(`Email: ${guest.email}`)
      lines.push(`Phone: ${guest.phone}`)
      lines.push(`Guests: ${guest.guests || '1'}`)
      lines.push(`QR Code: ${guest.qrCode}`)
      lines.push(`Checked In: ${guest.checkedIn ? "Yes" : "No"}`)
      if (guest.checkedIn && guest.checkedInAt) {
        lines.push(`Check-in Time: ${new Date(guest.checkedInAt).toLocaleString()}`)
      }
      lines.push(`RSVP Date: ${new Date(guest.rsvpDate).toLocaleString()}`)
      if (guest.dietaryRestrictions) {
        lines.push(`Dietary: ${guest.dietaryRestrictions}`)
      }
      if (guest.message) {
        lines.push(`Message: ${guest.message}`)
      }
      lines.push("-".repeat(30))
      lines.push("")
    })

    return lines.join("\n")
  }

  static importFromText(textData: string): { success: boolean; message: string; imported: number } {
    try {
      // Simple import format: each line with "field: value"
      const lines = textData.split("\n").filter((line) => line.trim())
      const guests: Guest[] = []
      let currentGuest: Partial<Guest> = {}
      let imported = 0

      for (const line of lines) {
        if (line.includes(":")) {
          const [field, ...valueParts] = line.split(":")
          const value = valueParts.join(":").trim()
          const fieldName = field.trim().toLowerCase()

          switch (fieldName) {
            case "name":
              if (Object.keys(currentGuest).length > 0) {
                if (currentGuest.name && currentGuest.qrCode) {
                  guests.push(currentGuest as Guest)
                  imported++
                }
                currentGuest = {}
              }
              currentGuest.name = value
              break
            case "email":
              currentGuest.email = value
              break
            case "phone":
              currentGuest.phone = value
              break
            case "guests":
              currentGuest.guests = value
              break
            case "qr code":
              currentGuest.qrCode = value
              break
            case "dietary":
              currentGuest.dietaryRestrictions = value
              break
            case "message":
              currentGuest.message = value
              break
          }
        }
      }

      // Add the last guest
      if (currentGuest.name && currentGuest.qrCode) {
        guests.push(currentGuest as Guest)
        imported++
      }

      // Save imported guests
      const existingGuests = this.getAllGuests()
      const allGuests = [
        ...existingGuests,
        ...guests.map((g) => ({
          ...g,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          checkedIn: false,
          rsvpDate: new Date().toISOString(),
        })),
      ]

      this.saveAllGuests(allGuests)

      return {
        success: true,
        message: `Successfully imported ${imported} guests`,
        imported,
      }
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error}`,
        imported: 0,
      }
    }
  }
}
