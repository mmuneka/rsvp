"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, QrCode, CheckCircle, XCircle, Clock, Download, UserCheck, Camera, LogOut } from "lucide-react"
import { SimpleDB, type Guest } from "@/lib/db"
import { QRScanner } from "@/components/qr-scanner"
import { useAuth } from "@/lib/auth"
import { RouteGuard } from "@/components/route-guard"

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [scannerInput, setScannerInput] = useState("")
  const [scanResult, setScanResult] = useState<{ success: boolean; guest?: Guest; message: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  // Load guests from database
  useEffect(() => {
    const loadGuests = () => {
      const dbGuests = SimpleDB.getAllGuests()
      setGuests(dbGuests)
    }

    loadGuests()

    // Refresh every 5 seconds to catch new RSVPs
    const interval = setInterval(loadGuests, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.qrCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalGuests = guests.reduce((sum, guest) => sum + Number.parseInt(guest.guests), 0)
  const checkedInGuests = guests.filter((guest) => guest.checkedIn)
  const totalCheckedIn = checkedInGuests.reduce((sum, guest) => sum + Number.parseInt(guest.guests), 0)

  const handleQRScan = (qrCode: string) => {
    const result = SimpleDB.checkInGuest(qrCode)
    setScanResult(result)

    if (result.success) {
      // Refresh guest list
      setGuests(SimpleDB.getAllGuests())
    }

    setScannerInput("")
  }

  const handleManualScan = () => {
    if (!scannerInput.trim()) {
      setScanResult({ success: false, message: "Please enter a QR code" })
      return
    }

    handleQRScan(scannerInput.trim())
  }

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Guests", "Dietary Restrictions", "Checked In", "Check-in Time", "RSVP Date"].join(
        ",",
      ),
      ...guests.map((guest) =>
        [
          guest.name,
          guest.email,
          guest.phone,
          guest.guests,
          guest.dietaryRestrictions,
          guest.checkedIn ? "Yes" : "No",
          guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleString() : "",
          new Date(guest.rsvpDate).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "yvonne-steve-wedding-guest-list.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-4">
        <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-serif text-gray-800 mb-2 tracking-wide">Wedding Admin Dashboard</h1>
            <p className="text-gray-600">Yvonne & Steve's Wedding - 24th August 2025</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => router.push("/admin/sheets")}
            >
              <span className="w-4 h-4">📊</span>
              Sheets
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{guests.length}</div>
              <div className="text-sm text-gray-600">Total RSVPs</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{totalGuests}</div>
              <div className="text-sm text-gray-600">Total Guests</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{checkedInGuests.length}</div>
              <div className="text-sm text-gray-600">Checked In</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{totalCheckedIn}</div>
              <div className="text-sm text-gray-600">Guests Present</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="guests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Guest List
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guests">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-gray-800 tracking-wide">Guest List</CardTitle>
                    <CardDescription>Manage and view all wedding RSVPs</CardDescription>
                  </div>
                  <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search guests by name, email, or QR code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Guest List */}
                <div className="space-y-4">
                  {filteredGuests.map((guest) => (
                    <Card key={guest.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-800">{guest.name}</h3>
                              <Badge
                                variant={guest.checkedIn ? "default" : "secondary"}
                                className="flex items-center gap-1"
                              >
                                {guest.checkedIn ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Checked In
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p>
                                  <strong>Email:</strong> {guest.email}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {guest.phone || "Not provided"}
                                </p>
                                <p>
                                  <strong>Guests:</strong> {guest.guests}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>RSVP Date:</strong> {new Date(guest.rsvpDate).toLocaleDateString()}
                                </p>
                                {guest.checkedIn && guest.checkedInAt && (
                                  <p>
                                    <strong>Checked In:</strong> {new Date(guest.checkedInAt).toLocaleString()}
                                  </p>
                                )}
                                <p>
                                  <strong>QR Code:</strong>{" "}
                                  <code className="text-xs bg-gray-100 px-1 rounded">{guest.qrCode}</code>
                                </p>
                              </div>
                            </div>

                            {guest.dietaryRestrictions && (
                              <div className="mt-2">
                                <p className="text-sm">
                                  <strong>Dietary:</strong> {guest.dietaryRestrictions}
                                </p>
                              </div>
                            )}

                            {guest.message && (
                              <div className="mt-2">
                                <p className="text-sm">
                                  <strong>Message:</strong> "{guest.message}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredGuests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No guests found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2 tracking-wide">
                  <QrCode className="w-6 h-6" />
                  Entrance QR Scanner
                </CardTitle>
                <CardDescription>Scan guest QR codes for check-in at the wedding entrance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Camera Scanner */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCamera(!showCamera)}
                      className={`flex-1 ${showCamera ? "bg-red-600 hover:bg-red-700" : "bg-lime-600 hover:bg-lime-700"}`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {showCamera ? "Close Camera" : "Open Camera Scanner"}
                    </Button>
                  </div>

                  {showCamera && <QRScanner onScan={handleQRScan} isActive={showCamera} />}
                </div>

                {/* Manual Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manual QR Code Entry</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="WEDDING-RSVP-1703123456-GuestName"
                        value={scannerInput}
                        onChange={(e) => setScannerInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
                        className="flex-1"
                      />
                      <Button onClick={handleManualScan} className="bg-green-600 hover:bg-green-700">
                        <QrCode className="w-4 h-4 mr-2" />
                        Check In
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <Card
                    className={`border-2 ${scanResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {scanResult.success ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                            {scanResult.message}
                          </p>
                          {scanResult.guest && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p>
                                <strong>Guest:</strong> {scanResult.guest.name}
                              </p>
                              <p>
                                <strong>Party Size:</strong> {scanResult.guest.guests} guest(s)
                              </p>
                              <p>
                                <strong>Email:</strong> {scanResult.guest.email}
                              </p>
                              {scanResult.guest.dietaryRestrictions && (
                                <p>
                                  <strong>Dietary Notes:</strong> {scanResult.guest.dietaryRestrictions}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                <Card className="bg-lime-50 border-lime-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lime-800 mb-2">Scanner Instructions:</h4>
                    <ul className="text-sm text-lime-700 space-y-1">
                      <li>• Use "Open Camera Scanner" for mobile camera scanning</li>
                      <li>• Or manually type/paste QR codes in the input field</li>
                      <li>• Green result = successful check-in</li>
                      <li>• Red result = invalid code or already checked in</li>
                      <li>• Camera works best with good lighting</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Recent Check-ins */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Check-ins</h4>
                  <div className="space-y-2">
                    {checkedInGuests
                      .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime())
                      .slice(0, 5)
                      .map((guest) => (
                        <div key={guest.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{guest.name}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(guest.checkedInAt!).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    {checkedInGuests.length === 0 && <p className="text-gray-500 text-sm">No guests checked in yet.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </RouteGuard>
  )
}
