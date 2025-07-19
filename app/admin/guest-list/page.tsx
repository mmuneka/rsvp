"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function GuestListPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadGuestList = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/get-guest-list')
      const data = await response.json()
      
      if (data.success) {
        setGuests(data.guests || [])
      } else {
        setError(data.error || 'Failed to load guest list')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Load guest list on page load
  useEffect(() => {
    loadGuestList()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Guest List</h1>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/add-test-guest');
                if (response.ok) {
                  loadGuestList();
                }
              } catch (error) {
                console.error('Error adding test guest:', error);
              }
            }} 
            variant="secondary"
          >
            Add Test Guest
          </Button>
          <Button 
            onClick={loadGuestList} 
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <h3 className="font-medium text-red-800">Error</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>RSVP Guests</CardTitle>
          <CardDescription>
            {guests.length} {guests.length === 1 ? 'guest' : 'guests'} have RSVP'd
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 && !isLoading && !error ? (
            <div className="text-center py-8 text-gray-500">
              No guests have RSVP'd yet
            </div>
          ) : (
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{guest.name}</h3>
                    {guest.checkedIn ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Checked In
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Not Checked In</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Email: {guest.email}</p>
                    {guest.phone && <p>Phone: {guest.phone}</p>}
                    {guest.message && <p>Message: "{guest.message}"</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      RSVP Date: {new Date(guest.rsvpDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}