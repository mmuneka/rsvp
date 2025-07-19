"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, RotateCcw } from "lucide-react"

interface QRScannerProps {
  onScan: (result: string) => void
  isActive: boolean
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  const startCamera = async () => {
    try {
      setError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (err) {
      setError("Camera access denied or not available")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Simple QR code detection (looking for patterns)
    // In a real implementation, you'd use a proper QR code library
    // For now, we'll simulate detection by looking for high contrast patterns
    const detected = detectQRPattern(imageData)

    if (detected) {
      // Simulate QR code reading - in real app, use jsQR or similar library
      const mockQRCode = `WEDDING-RSVP-${Date.now()}-MockScan`
      onScan(mockQRCode)
      setIsScanning(false)
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }

  // Simple pattern detection (placeholder for real QR detection)
  const detectQRPattern = (imageData: ImageData): boolean => {
    // This is a simplified detection - in reality you'd use jsQR library
    // For demo purposes, we'll randomly "detect" QR codes
    return Math.random() < 0.1 // 10% chance per scan
  }

  const toggleScanning = () => {
    if (isScanning) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      setIsScanning(false)
    } else {
      setIsScanning(true)
      scanIntervalRef.current = setInterval(scanQRCode, 500) // Scan every 500ms
    }
  }

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive])

  if (!isActive) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-green-500 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

        <div className="flex gap-2">
          <Button
            onClick={toggleScanning}
            disabled={!stream}
            className={`flex-1 ${isScanning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Scanning
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              stopCamera()
              setTimeout(startCamera, 100)
            }}
            variant="outline"
            disabled={!stream}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>• Point camera at QR code</p>
          <p>• Hold steady for automatic detection</p>
          <p>• Make sure QR code is well lit</p>
        </div>
      </CardContent>
    </Card>
  )
}
