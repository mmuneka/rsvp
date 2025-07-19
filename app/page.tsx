"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Download, Check, Settings, Leaf } from "lucide-react"
import Link from "next/link"
import { SimpleDB } from "@/lib/db"
import { saveGuestToSheet } from "@/lib/sheets"

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

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate QR code data
      const qrData = `WEDDING-RSVP-${Date.now()}-${rsvpData.name.replace(/\s+/g, "")}`
      setQrCode(qrData)

      // Save to local database
      const savedGuest = SimpleDB.saveGuest({
        ...rsvpData,
        qrCode: qrData,
      })

      try {
        // Save to Google Sheet
        const sheetSaved = await saveGuestToSheet(savedGuest)
        if (!sheetSaved) {
          console.warn('Failed to save to Google Sheet, but local save succeeded')
        }
      } catch (sheetError) {
        console.error("Error saving to Google Sheet:", sheetError)
        // Continue even if Google Sheets save fails
      }
      
      setCurrentStep("confirmation")
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

    // Set canvas size for a card format
    canvas.width = 600
    canvas.height = 800

    if (ctx) {
      // Create clean white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 600, 800)

      // Draw eucalyptus leaves decoration (simplified botanical design)
      const drawLeaf = (x: number, y: number, width: number, height: number, rotation = 0) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)

        // Create leaf gradient
        const leafGradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2)
        leafGradient.addColorStop(0, "#9ca3af") // gray-400
        leafGradient.addColorStop(0.5, "#84cc16") // lime-500
        leafGradient.addColorStop(1, "#65a30d") // lime-600

        ctx.fillStyle = leafGradient
        ctx.beginPath()
        ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.restore()
      }

      // Draw botanical decoration in top right
      drawLeaf(480, 80, 30, 60, 0.3)
      drawLeaf(510, 110, 25, 50, -0.2)
      drawLeaf(450, 120, 28, 55, 0.8)
      drawLeaf(520, 140, 22, 45, -0.5)

      // Draw stem
      ctx.strokeStyle = "#84cc16"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(460, 90)
      ctx.quadraticCurveTo(480, 110, 500, 130)
      ctx.quadraticCurveTo(510, 140, 520, 155)
      ctx.stroke()

      // Couple names - large, elegant typography
      ctx.fillStyle = "#1f2937" // gray-800
      ctx.font = "bold 48px serif"
      ctx.textAlign = "center"
      ctx.letterSpacing = "3px"
      ctx.fillText("YVONNE", 300, 120)

      ctx.font = "bold 36px serif"
      ctx.fillText("&", 300, 160)

      ctx.font = "bold 48px serif"
      ctx.fillText("STEVE", 300, 200)

      // Invitation text
      ctx.font = "16px sans-serif"
      ctx.fillStyle = "#4b5563" // gray-600
      ctx.textAlign = "center"
      ctx.fillText("TOGETHER WITH THEIR FAMILIES", 300, 260)
      ctx.fillText("REQUEST THE PLEASURE", 300, 285)
      ctx.fillText("OF YOUR COMPANY AT", 300, 310)
      ctx.fillText("THE CELEBRATION OF THEIR UNION", 300, 335)

      // Date and time
      ctx.font = "20px sans-serif"
      ctx.fillStyle = "#1f2937"
      ctx.fillText("24TH AUGUST 2025", 300, 390)
      ctx.fillText("1300 HRS TILL LATE", 300, 420)

      // Venue information
      ctx.font = "18px sans-serif"
      ctx.fillStyle = "#374151"
      ctx.fillText("MILLFIELD HALL", 300, 470)
      ctx.fillText("BRAUNSTONE CIVIC CENTRE", 300, 495)
      ctx.font = "16px sans-serif"
      ctx.fillText("209 KINGSWAY, BRAUNSTONE TOWN", 300, 520)
      ctx.fillText("LEICESTER LE3 2PP", 300, 545)

      // Guest information section
      ctx.font = "20px sans-serif"
      ctx.fillStyle = "#1f2937"
      ctx.fillText("Guest Information", 300, 590)

      ctx.font = "16px sans-serif"
      ctx.fillStyle = "#374151"
      ctx.fillText(`Name: ${rsvpData.name}`, 300, 620)
      if (rsvpData.phone) {
        ctx.fillText(`Phone: ${rsvpData.phone}`, 300, 645)
      }

      // QR Code section
      ctx.font = "18px sans-serif"
      ctx.fillStyle = "#1f2937"
      ctx.fillText("Entrance QR Code", 300, 710)

      // QR Code background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(225, 720, 150, 150)
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 2
      ctx.strokeRect(225, 720, 150, 150)

      // Generate QR code pattern
      ctx.fillStyle = "#000000"
      const qrSize = 130
      const cellSize = qrSize / 21
      const startX = 235
      const startY = 730

      // QR code pattern
      const qrPattern = [
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      ]

      for (let row = 0; row < 21; row++) {
        for (let col = 0; col < 21; col++) {
          if (qrPattern[row] && qrPattern[row][col]) {
            ctx.fillRect(startX + col * cellSize, startY + row * cellSize, cellSize, cellSize)
          }
        }
      }

      // Add subtle border
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1
      ctx.strokeRect(20, 20, 560, 760)
    }

    // Download the card
    const link = document.createElement("a")
    link.download = `wedding-invitation-${rsvpData.name.replace(/\s+/g, "-")}.png`
    link.href = canvas.toDataURL("image/png", 1.0)
    link.click()
  }

  if (currentStep === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
        {/* Admin Link */}
        <div className="absolute top-4 right-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm">
              <Settings className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </div>

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
                className="bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                RSVP Now
                <Leaf className="w-5 h-5 ml-2" fill="currentColor" />
              </Button>
              <p className="text-sm text-gray-500 mt-4">Please respond by 1st August 2025</p>
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
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* QR Code Pattern Simulation */}
                    <div className="absolute inset-2 bg-white rounded">
                      <div className="grid grid-cols-12 gap-px h-full w-full p-2">
                        {Array.from({ length: 144 }, (_, i) => (
                          <div
                            key={i}
                            className={`${(i + Math.floor(i / 12)) % 3 === 0 ? "bg-black" : "bg-white"} rounded-sm`}
                          />
                        ))}
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
