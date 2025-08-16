'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, RotateCcw, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MobileCameraUploadProps {
  onImageCapture: (file: File, preview: string) => void
  onImageUpload: (files: FileList) => void
  maxImages?: number
  currentImages?: string[]
  className?: string
}

interface CapturedImage {
  file: File
  preview: string
  id: string
}

export default function MobileCameraUpload({
  onImageCapture,
  onImageUpload,
  maxImages = 10,
  currentImages = [],
  className = ''
}: MobileCameraUploadProps) {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if device supports camera
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    'mediaDevices' in navigator
  )

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Unable to access camera. Please check permissions.')
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      const preview = canvas.toDataURL('image/jpeg', 0.8)
      const capturedImage: CapturedImage = {
        file,
        preview,
        id: Date.now().toString()
      }

      setCapturedImages(prev => [...prev, capturedImage])
      onImageCapture(file, preview)
      
      toast.success('Image captured successfully!')
    }, 'image/jpeg', 0.8)
  }

  const compressImage = (file: File, targetSizeKB: number = 500): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      const img = new Image()
      
      img.onload = () => {
        try {
          // Progressive dimension reduction based on file size
          let maxWidth = 1920
          let maxHeight = 1080
          
          // Adjust max dimensions based on original file size
          const fileSizeMB = file.size / (1024 * 1024)
          if (fileSizeMB > 10) {
            maxWidth = 1280
            maxHeight = 720
          } else if (fileSizeMB > 5) {
            maxWidth = 1600
            maxHeight = 900
          }
          
          let { width, height } = img
          
          // Calculate aspect ratio preserving dimensions
          const aspectRatio = width / height
          if (width > maxWidth || height > maxHeight) {
            if (aspectRatio > 1) {
              width = Math.min(width, maxWidth)
              height = width / aspectRatio
            } else {
              height = Math.min(height, maxHeight)
              width = height * aspectRatio
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Enhanced drawing with better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
          
          // Progressive quality reduction to meet target size
          const tryCompress = (quality: number) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeKB = blob.size / 1024
                  
                  if (sizeKB <= targetSizeKB || quality <= 0.3) {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    })
                    resolve(compressedFile)
                  } else {
                    // Reduce quality and try again
                    tryCompress(quality - 0.1)
                  }
                } else {
                  reject(new Error('Failed to compress image'))
                }
              },
              'image/jpeg',
              quality
            )
          }
          
          // Start with high quality and reduce if needed
          tryCompress(0.9)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const totalImages = currentImages.length + capturedImages.length + files.length
    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      // Determine target compression based on device capabilities
      const deviceMemory = (navigator as any).deviceMemory || 4
      const connectionSpeed = (navigator as any).connection?.effectiveType || '4g'
      
      let targetSizeKB = 500
      if (deviceMemory < 2 || connectionSpeed === 'slow-2g' || connectionSpeed === '2g') {
        targetSizeKB = 200
      } else if (connectionSpeed === '3g') {
        targetSizeKB = 350
      }

      // Compress images with adaptive quality
      const compressedFiles = await Promise.all(
        Array.from(files).map(file => compressImage(file, targetSizeKB))
      )

      // Create FileList-like object
      const dataTransfer = new DataTransfer()
      compressedFiles.forEach(file => dataTransfer.items.add(file))
      
      onImageUpload(dataTransfer.files)
      
      // Show compression stats
      const totalOriginalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)
      const totalCompressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0)
      const compressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
      
      if (parseFloat(compressionRatio) > 10) {
        toast.success(`Images compressed by ${compressionRatio}%`)
      }
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to process images. Please try again.')
    }
    
    // Reset input
    event.target.value = ''
  }

  const removeImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id))
  }

  const totalImages = currentImages.length + capturedImages.length
  const canAddMore = totalImages < maxImages

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera Interface */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Camera Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={stopCamera}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <button
                  onClick={captureImage}
                  className="p-4 bg-white hover:bg-gray-100 text-black rounded-full transition-colors"
                >
                  <Camera className="w-8 h-8" />
                </button>
                
                <div className="p-3 bg-gray-800 text-white rounded-full">
                  <span className="text-sm font-medium">{totalImages}/{maxImages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload Controls */}
      {!isCapturing && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Camera Button */}
            {isMobile && canAddMore && (
              <button
                onClick={startCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
            )}

            {/* File Upload Button */}
            {canAddMore && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Image Counter */}
          <div className="text-sm text-gray-600">
            {totalImages} of {maxImages} images
            {!canAddMore && (
              <span className="text-amber-600 ml-2">Maximum reached</span>
            )}
          </div>

          {/* Captured Images Preview */}
          {capturedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Captured"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-xs rounded">
                    New
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}