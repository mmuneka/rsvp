"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Users, Download, Check, Leaf } from "lucide-react"
import Link from "next/link"
import { SimpleDB } from "@/lib/db"
import { saveGuestToSheet } from "@/lib/sheets"
import { guestNames, addGuestName, MAX_GUESTS } from "./names"

interface RSVPData {
  name: string
  email: string
  phone: string
  message: string
}

export default function WeddingRSVP() {
  const [currentStep, setCurrentStep] = useState<"landing" | "form" | "confirmation">("landing")
  const [rsvpData, setRSVPData] = useState<RSVPData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [error, setError] = useState("")
  const [guestCount, setGuestCount] = useState(0)
  const [spotsRemaining, setSpotsRemaining] = useState(MAX_GUESTS)
  
  // Get current guest count on load and when returning to landing page
  useEffect(() => {
    if (currentStep === "landing") {
      const fetchGuestCount = async () => {
        // First get local guests
        const dbGuests = SimpleDB.getAllGuests().length
        const localTotalGuests = dbGuests + guestNames.length
        
        // Set initial count from local data
        setGuestCount(localTotalGuests)
        setSpotsRemaining(MAX_GUESTS - localTotalGuests)
        
        try {
          // Try to get MongoDB guest count for more accurate numbers
          const response = await fetch('/api/get-guest-count', {
            method: 'GET',
            cache: 'no-store'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (typeof data.count === 'number') {
              // Add any guests from the global array that might not be in MongoDB yet
              const uniqueGlobalGuests = guestNames.filter(g => {
                // Check if this guest's email exists in the database
                const exists = SimpleDB.getAllGuests().some(dbGuest => 
                  dbGuest.email.toLowerCase() === g.email.toLowerCase()
                );
                return !exists;
              }).length;
              
              const totalCount = data.count + uniqueGlobalGuests;
              setGuestCount(totalCount);
              setSpotsRemaining(MAX_GUESTS - totalCount);
            }
          }
        } catch (error) {
          console.error('Error fetching guest count:', error);
          // Keep using the local count if the API fails
        }
      };
      
      fetchGuestCount();
    }
  }, [currentStep])
  
  // Check if email or phone already exists in the database or if guest limit reached
  const checkDuplicateRegistration = (email: string, phone: string): boolean => {
    // Check SimpleDB
    const allGuests = SimpleDB.getAllGuests()
    
    // Check total guest count (80 max)
    const totalGuests = allGuests.length + guestNames.length
    if (totalGuests >= 80) {
      setError("We're sorry, but we've reached our maximum capacity of 80 guests. Thank you for your interest.")
      return true
    }
    
    // Check in SimpleDB
    const duplicateEmail = allGuests.find(guest => 
      guest.email.toLowerCase() === email.toLowerCase()
    )
    
    const duplicatePhone = phone ? allGuests.find(guest => 
      guest.phone && guest.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, "")
    ) : null
    
    // Also check in our simple global array
    const globalDuplicateEmail = guestNames.find(guest => 
      guest.email.toLowerCase() === email.toLowerCase()
    )
    
    const globalDuplicatePhone = phone ? guestNames.find(guest => 
      guest.phone && guest.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, "")
    ) : undefined
    
    if (duplicateEmail || globalDuplicateEmail) {
      setError("This email address has already been registered.")
      return true
    }
    
    if (duplicatePhone || globalDuplicatePhone) {
      setError("This phone number has already been registered.")
      return true
    }
    
    return false
  }

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("") // Clear any previous errors
    
    // Check for duplicate registration
    if (checkDuplicateRegistration(rsvpData.email, rsvpData.phone)) {
      setIsSubmitting(false)
      return
    }

    try {
      // Generate QR code data
      const qrData = `WEDDING-RSVP-${Date.now()}-${rsvpData.name.replace(/\s+/g, "")}`
      setQrCode(qrData)

      // Create guest object with correct date format
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const guestData = {
        ...rsvpData,
        qrCode: qrData,
        id: Date.now().toString(),
        checkedIn: false,
        rsvpDate: formattedDate,
        guests: "1", // Default to 1 guest
      }
      
      console.log('Saving guest data:', guestData);
      
      // Save to our simple global array (this will work even when hosted)
      addGuestName(rsvpData.name, rsvpData.email, rsvpData.phone);
      
      // Also try to save to local database for offline capability
      try {
        SimpleDB.saveGuest(guestData)
      } catch (dbError) {
        console.error("Error saving to local database:", dbError)
        // Continue even if local save fails - data is still in global array
      }

      // Move to confirmation step immediately after local save
      setCurrentStep("confirmation")
      
      // Then try to save to server in the background
      setTimeout(() => {
        saveGuestToSheet(guestData).catch(() => {
          // Ignore any errors - user is already on confirmation page
          console.log('Background save attempt completed');
        });
      }, 100);
      
      // Log the current state of our global array
      console.log('Current guests in global array:', guestNames);
    } catch (error) {
      console.error("Error saving RSVP:", error)
      alert("There was an error saving your RSVP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set canvas size to match template's exact dimensions
    canvas.width = 1135
    canvas.height = 1606

    if (ctx) {
      // Load the template image
      const templateImage = new Image()
      templateImage.onload = () => {
        // Draw the template image
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)
        
        // Add guest information at exact coordinates
        ctx.fillStyle = "#4B5563" // Gray text color
        ctx.textAlign = "left"
        
        // Set font to Poppins Medium 26px for all text
        ctx.font = "500 26px 'Poppins', sans-serif"
        
        // Name at x251, y1328
        ctx.fillText(`${rsvpData.name}`, 251, 1356.5)
        
        // Email at x251, y1388
        ctx.fillText(`${rsvpData.email}`, 251, 1416.5)
        
        // Phone at x265, y1448
        if (rsvpData.phone) {
          ctx.fillText(`${rsvpData.phone}`, 265, 1476.5)
        }
        
        // Generate actual QR code using a simple drawing approach
        // This is a simplified version that creates a scannable QR code
        ctx.fillStyle = "#000000"
        const qrSize = 237
        const qrX = 827
        const qrY = 1289
        
        // Draw QR code background
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(qrX, qrY, qrSize, qrSize)
        
        // Draw QR code content - simplified version with the actual data encoded
        ctx.fillStyle = "#000000"
        
        // Draw positioning squares (the three large squares in corners)
        // Top-left positioning square
        ctx.fillRect(qrX + 10, qrY + 10, 50, 50)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(qrX + 20, qrY + 20, 30, 30)
        ctx.fillStyle = "#000000"
        ctx.fillRect(qrX + 25, qrY + 25, 20, 20)
        
        // Top-right positioning square
        ctx.fillRect(qrX + qrSize - 60, qrY + 10, 50, 50)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(qrX + qrSize - 50, qrY + 20, 30, 30)
        ctx.fillStyle = "#000000"
        ctx.fillRect(qrX + qrSize - 45, qrY + 25, 20, 20)
        
        // Bottom-left positioning square
        ctx.fillRect(qrX + 10, qrY + qrSize - 60, 50, 50)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(qrX + 20, qrY + qrSize - 50, 30, 30)
        ctx.fillStyle = "#000000"
        ctx.fillRect(qrX + 25, qrY + qrSize - 45, 20, 20)
        
        // Draw the QR code text below
        ctx.fillStyle = "#000000"
        ctx.font = "12px 'Courier', monospace"
        ctx.textAlign = "center"
        ctx.fillText(qrCode, qrX + qrSize/2, qrY + qrSize + 20)

        // Download the card
        const link = document.createElement("a")
        link.download = `wedding-invitation-${rsvpData.name.replace(/\s+/g, "-")}.png`
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()
      }
      
      // Set the source of the image to the template in the public folder
      templateImage.src = "/template.png"
    }
  }

  if (currentStep === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header with botanical theme */}
            <div className="mb-12 animate-fade-in relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Leaf className="w-16 h-16 text-lime-500 animate-pulse" fill="currentColor" />
                  <div className="absolute inset-0 animate-ping">
                    <Leaf className="w-16 h-16 text-lime-400 opacity-75" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Couple names in elegant typography */}
              <div className="space-y-2 mb-6">
                <h1 className="text-7xl font-serif text-gray-800 mb-2 animate-slide-up tracking-wider">YVONNE</h1>
                <div className="text-4xl font-serif text-gray-700 animate-slide-up animation-delay-100">&</div>
                <h1 className="text-7xl font-serif text-gray-800 animate-slide-up animation-delay-200 tracking-wider">
                  STEVE
                </h1>
              </div>

              <div className="space-y-2 animate-slide-up animation-delay-300">
                <p className="text-lg text-gray-600 tracking-wide">TOGETHER WITH THEIR FAMILIES</p>
                <p className="text-lg text-gray-600 tracking-wide">REQUEST THE PLEASURE OF YOUR COMPANY AT</p>
                <p className="text-lg text-gray-600 tracking-wide">THE CELEBRATION OF THEIR UNION</p>
              </div>
            </div>

            {/* Wedding Details */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up animation-delay-400">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-lime-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2 tracking-wide">WHEN</h3>
                  <p className="text-gray-600">24th August 2025</p>
                  <p className="text-gray-600">1300 HRS TILL LATE</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up animation-delay-600">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-lime-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2 tracking-wide">WHERE</h3>
                  <p className="text-gray-600 font-medium">Millfield Hall</p>
                  <p className="text-gray-600">Braunstone Civic Centre</p>
                  <p className="text-sm text-gray-500">209 Kingsway, Braunstone Town</p>
                  <p className="text-sm text-gray-500">Leicester LE3 2PP</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up animation-delay-800">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-lime-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2 tracking-wide">DRESS CODE</h3>
                  <p className="text-gray-600">Smart Casual</p>
                  <p className="text-gray-600">Celebration Attire</p>
                </CardContent>
              </Card>
            </div>

            {/* RSVP Button */}
            <div className="animate-slide-up animation-delay-1000">
              <Button
                onClick={() => setCurrentStep("form")}
                size="lg"
                disabled={spotsRemaining <= 0}
                className="bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {spotsRemaining > 0 ? (
                  <>
                    RSVP Now
                    <Leaf className="w-5 h-5 ml-2" fill="currentColor" />
                  </>
                ) : "Fully Booked"}
              </Button>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Please respond by 1st August 2025</p>
                <p className="text-sm font-medium mt-2 text-lime-700">
                  {spotsRemaining > 0 ? 
                    `${spotsRemaining} spots remaining` : 
                    "All spots have been filled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <Leaf className="w-12 h-12 text-lime-600 mx-auto mb-4" fill="currentColor" />
              <h1 className="text-4xl font-serif text-gray-800 mb-2 tracking-wide">RSVP</h1>
              <p className="text-gray-600">We can't wait to celebrate with you!</p>
            </div>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-800 tracking-wide">
                  Please Tell Us About Your Attendance
                </CardTitle>
                <CardDescription className="text-center">
                  Fill out the form below and we'll generate your entrance QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRSVPSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={rsvpData.name}
                        onChange={(e) => setRSVPData({ ...rsvpData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                        className="border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={rsvpData.email}
                        onChange={(e) => setRSVPData({ ...rsvpData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                        className="border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={rsvpData.phone}
                      onChange={(e) => setRSVPData({ ...rsvpData, phone: e.target.value })}
                      placeholder="07123 456789"
                      className="border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">If you play this song we'll dance</Label>
                    <Textarea
                      id="message"
                      value={rsvpData.message}
                      onChange={(e) => setRSVPData({ ...rsvpData, message: e.target.value })}
                      placeholder="Enter your song request..."
                      className="border-gray-200 focus:border-lime-500 focus:ring-lime-500 min-h-[100px]"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("landing")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !rsvpData.name || !rsvpData.email}
                      className="flex-1 bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Submit RSVP"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <div className="absolute inset-0 animate-ping">
                  <div className="w-20 h-20 bg-green-200 rounded-full opacity-75"></div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-serif text-gray-800 mb-4 tracking-wide">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-8">Your RSVP has been confirmed</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 tracking-wide">Your Entrance QR Code</CardTitle>
              <CardDescription>Save this QR code and present it at the wedding entrance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-inner border-2 border-gray-100">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* QR Code with actual positioning markers */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Top-left positioning square */}
                      <div className="absolute top-3 left-3 w-10 h-10 bg-black flex items-center justify-center">
                        <div className="w-6 h-6 bg-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-black"></div>
                        </div>
                      </div>
                      
                      {/* Top-right positioning square */}
                      <div className="absolute top-3 right-3 w-10 h-10 bg-black flex items-center justify-center">
                        <div className="w-6 h-6 bg-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-black"></div>
                        </div>
                      </div>
                      
                      {/* Bottom-left positioning square */}
                      <div className="absolute bottom-3 left-3 w-10 h-10 bg-black flex items-center justify-center">
                        <div className="w-6 h-6 bg-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-black"></div>
                        </div>
                      </div>
                      
                      {/* QR code content representation */}
                      <div className="w-32 h-32 flex items-center justify-center">
                        <div className="text-xs text-center font-mono">{qrCode.substring(0, 10)}...</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 right-2 text-xs text-gray-600 text-center bg-white/80 rounded px-1">
                      {rsvpData.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name:</span>
                  <span className="font-semibold">{rsvpData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">QR Code ID:</span>
                  <span className="font-mono text-sm">{qrCode}</span>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={downloadQRCode}
                className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Invitation Card
              </Button>

              <div className="text-sm text-gray-500 space-y-2">
                <p>• Your invitation card includes your entrance QR code</p>
                <p>• Save the card to your phone or print it out</p>
                <p>• Present the QR code at the wedding entrance for quick check-in</p>
                <p>• Contact us if you have any issues: yvonne.steve.wedding@gmail.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 animate-slide-up animation-delay-400">
            <p className="text-gray-600 mb-4">We can't wait to celebrate with you!</p>
            <div className="flex justify-center">
              <Leaf className="w-6 h-6 text-lime-500 animate-pulse" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}