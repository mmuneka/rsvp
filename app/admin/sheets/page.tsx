"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SheetsAdmin() {
  const [testResult, setTestResult] = useState<any>(null)
  const [statusResult, setStatusResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSheetStatus = async () => {
    setIsCheckingStatus(true)
    setError(null)
    
    try {
      const response = await fetch('/api/check-sheet-status')
      const data = await response.json()
      
      setStatusResult(data)
      if (!data.success) {
        setError(data.error || 'Unknown error')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check Google Sheets status')
      setStatusResult(null)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const testSheetsConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/add-test-entry')
      const data = await response.json()
      
      setTestResult(data)
      if (!data.success) {
        setError(data.error || 'Unknown error')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test Google Sheets connection')
      setTestResult(null)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Check status on page load
  useEffect(() => {
    checkSheetStatus()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Google Sheets Integration</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Sheets Status</CardTitle>
          <CardDescription>
            Current status of your Google Sheets integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={checkSheetStatus} 
              disabled={isCheckingStatus}
              variant="outline"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Status'}
            </Button>
            
            <Button 
              onClick={testSheetsConnection} 
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Add Test Entry'}
            </Button>
          </div>
          
          {statusResult && statusResult.success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Connected</h3>
              </div>
              <div className="mt-2 text-sm">
                <p><strong>Sheet:</strong> {statusResult.sheetTitle}</p>
                <p><strong>Auth Method:</strong> {statusResult.authMethod === 'file' ? 'Credentials File' : 'Environment Variables'}</p>
                <p>
                  <a 
                    href={statusResult.sheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Google Sheet
                  </a>
                </p>
              </div>
            </div>
          )}
          
          {statusResult && !statusResult.success && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-800">Not Connected</h3>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Your Google Sheets integration is not properly configured.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <h3 className="font-medium text-red-800">Error</h3>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
          
          {testResult && testResult.success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Success</h3>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Test entry was successfully added to your Google Sheet
              </p>
            </div>
          )}
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">API Response:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up the Google Sheets integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">1. Create a Google Cloud Project</h3>
            <p className="text-sm text-gray-600">
              Go to the Google Cloud Console and create a new project or select an existing one.
              Enable the Google Sheets API for your project.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">2. Create a Service Account</h3>
            <p className="text-sm text-gray-600">
              In your Google Cloud project, go to "IAM & Admin" > "Service Accounts".
              Create a new service account with appropriate permissions.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">3. Create and Download Service Account Key</h3>
            <p className="text-sm text-gray-600">
              Create a JSON key for your service account and download it.
              Rename it to google-credentials.json and place it in the root directory of your project.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">4. Share Your Google Sheet</h3>
            <p className="text-sm text-gray-600">
              Share your Google Sheet with the service account email, giving it Editor access.
            </p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm">
              For detailed instructions, see the GOOGLE_SHEETS_SETUP.md file in your project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}