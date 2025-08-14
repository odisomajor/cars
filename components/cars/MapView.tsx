'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, X } from 'lucide-react'

interface Car {
  id: string
  title: string
  price: number
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  image: string
  make: string
  model: string
  year: number
}

interface MapViewProps {
  cars: Car[]
  onCarSelect: (car: Car) => void
  selectedCarId?: string
  className?: string
}

// Mock coordinates for Kenyan cities
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Nairobi': { lat: -1.2921, lng: 36.8219 },
  'Mombasa': { lat: -4.0435, lng: 39.6682 },
  'Kisumu': { lat: -0.0917, lng: 34.7680 },
  'Nakuru': { lat: -0.3031, lng: 36.0800 },
  'Eldoret': { lat: 0.5143, lng: 35.2698 },
  'Thika': { lat: -1.0332, lng: 37.0692 },
  'Machakos': { lat: -1.5177, lng: 37.2634 },
  'Meru': { lat: 0.0467, lng: 37.6556 },
  'Nyeri': { lat: -0.4167, lng: 36.9500 },
  'Kericho': { lat: -0.3676, lng: 35.2861 }
}

function MapView({ cars, onCarSelect, selectedCarId, className = '' }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 }) // Nairobi center
  const [zoomLevel, setZoomLevel] = useState(7)
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [showSatellite, setShowSatellite] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Add coordinates to cars based on their location
  const carsWithCoordinates = cars.map(car => ({
    ...car,
    coordinates: cityCoordinates[car.location] || cityCoordinates['Nairobi']
  }))

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleMarkerClick = (car: Car) => {
    setSelectedMarker(car.id)
    onCarSelect(car)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 15))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 5))
  }

  const handleCenterMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setZoomLevel(10)
        },
        () => {
          // Fallback to Nairobi if geolocation fails
          setMapCenter({ lat: -1.2921, lng: 36.8219 })
        }
      )
    }
  }

  // Group cars by location for clustering
  const groupedCars = carsWithCoordinates.reduce((acc, car) => {
    const key = `${car.coordinates.lat}-${car.coordinates.lng}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(car)
    return acc
  }, {} as Record<string, Car[]>)

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full min-h-[400px] bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden"
        style={{
          backgroundImage: showSatellite 
            ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2306b6d4" fill-opacity="0.05" fill-rule="evenodd"%3E%3Cpath d="m0 40l40-40h-40v40zm40 0v-40h-40l40 40z"/%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        {/* Map Markers */}
        {Object.entries(groupedCars).map(([key, locationCars]) => {
          const [lat, lng] = key.split('-').map(Number)
          const isCluster = locationCars.length > 1
          const representativeCar = locationCars[0]
          
          // Calculate marker position (simplified projection)
          const x = ((lng - mapCenter.lng) * Math.cos(mapCenter.lat * Math.PI / 180) * zoomLevel * 10) + 50
          const y = ((mapCenter.lat - lat) * zoomLevel * 10) + 50
          
          return (
            <div
              key={key}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${Math.max(0, Math.min(100, x))}%`,
                top: `${Math.max(0, Math.min(100, y))}%`,
                zIndex: selectedMarker === representativeCar.id ? 20 : 10
              }}
              onClick={() => handleMarkerClick(representativeCar)}
            >
              {isCluster ? (
                <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                  {locationCars.length}
                </div>
              ) : (
                <div className={`bg-white rounded-full p-2 shadow-lg border-2 transition-colors ${
                  selectedMarker === representativeCar.id 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-secondary-300 hover:border-primary-400'
                }`}>
                  <MapPin className={`w-4 h-4 ${
                    selectedMarker === representativeCar.id 
                      ? 'text-primary-600' 
                      : 'text-secondary-600'
                  }`} />
                </div>
              )}
              
              {/* Marker Popup */}
              {selectedMarker === representativeCar.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-secondary-200 p-3 z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMarker(null)
                    }}
                    className="absolute top-2 right-2 text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {isCluster ? (
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">
                        {locationCars.length} cars in {representativeCar.location}
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {locationCars.slice(0, 3).map(car => (
                          <div key={car.id} className="flex items-center space-x-2 text-sm">
                            <div className="w-8 h-6 bg-secondary-200 rounded flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{car.make} {car.model}</p>
                              <p className="text-primary-600 font-semibold">{formatPrice(car.price)}</p>
                            </div>
                          </div>
                        ))}
                        {locationCars.length > 3 && (
                          <p className="text-xs text-secondary-500 text-center">
                            +{locationCars.length - 3} more cars
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-12 bg-secondary-200 rounded flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-secondary-900 truncate">
                          {representativeCar.title}
                        </h4>
                        <p className="text-primary-600 font-semibold">
                          {formatPrice(representativeCar.price)}
                        </p>
                        <p className="text-sm text-secondary-600 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {representativeCar.location}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-secondary-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-secondary-50 transition-colors border-b border-secondary-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-secondary-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-secondary-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-secondary-600" />
          </button>
        </div>

        {/* Layer Toggle */}
        <button
          onClick={() => setShowSatellite(!showSatellite)}
          className={`p-2 rounded-lg shadow-lg border border-secondary-200 transition-colors ${
            showSatellite 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-secondary-600 hover:bg-secondary-50'
          }`}
          title="Toggle Satellite View"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Center on Location */}
        <button
          onClick={handleCenterMap}
          className="p-2 bg-white rounded-lg shadow-lg border border-secondary-200 text-secondary-600 hover:bg-secondary-50 transition-colors"
          title="Center on My Location"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-secondary-200 p-3">
        <h4 className="font-semibold text-secondary-900 mb-2 text-sm">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-secondary-300 flex items-center justify-center">
              <MapPin className="w-2 h-2 text-secondary-600" />
            </div>
            <span className="text-secondary-600">Single car</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-secondary-600">Multiple cars</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView