'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface EditListingPageProps {}

const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
  'Infiniti', 'Acura', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Ram',
  'Jeep', 'Chrysler', 'Dodge', 'Mitsubishi', 'Volvo', 'Jaguar', 'Land Rover',
  'Porsche', 'Tesla', 'Genesis', 'Alfa Romeo', 'Maserati', 'Bentley',
  'Rolls-Royce', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin'
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van', 'Minivan'];
const CONDITIONS = ['New', 'Used', 'Certified Pre-Owned'];
const RENTAL_CATEGORIES = ['Economy', 'Compact', 'Mid-size', 'Full-size', 'Premium', 'Luxury', 'SUV', 'Pickup'];

const COMMON_FEATURES = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
  'Anti-lock Braking System (ABS)', 'Airbags', 'Alloy Wheels', 'Fog Lights',
  'Sunroof', 'Leather Seats', 'Heated Seats', 'GPS Navigation',
  'Bluetooth Connectivity', 'USB Ports', 'Backup Camera', 'Parking Sensors',
  'Cruise Control', 'Keyless Entry', 'Push Button Start', 'Automatic Headlights'
];

export default function EditListingPage({}: EditListingPageProps) {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listingType, setListingType] = useState<'sale' | 'rental'>('sale');
  const [originalType, setOriginalType] = useState<'sale' | 'rental'>('sale');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    pricePerDay: '',
    mileage: '',
    condition: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    category: '',
    seats: '',
    color: '',
    location: '',
    engineSize: '',
    minRentalDays: '1',
    maxRentalDays: '',
    availableFrom: '',
    availableTo: '',
    listingPackage: 'free',
    status: 'draft'
  });
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && params.id) {
      fetchListing();
    }
  }, [status, params.id]);

  const fetchListing = async () => {
    try {
      // Try to fetch from regular listings first
      let response = await fetch(`/api/listings/${params.id}`);
      let listing = null;
      let type: 'sale' | 'rental' = 'sale';
      
      if (response.ok) {
        listing = await response.json();
        type = 'sale';
      } else {
        // Try rental listings
        response = await fetch(`/api/rental-listings/${params.id}`);
        if (response.ok) {
          listing = await response.json();
          type = 'rental';
        }
      }

      if (!listing) {
        router.push('/dashboard/listings');
        return;
      }

      // Check if user owns this listing
      if (listing.userId !== session?.user?.id) {
        router.push('/dashboard/listings');
        return;
      }

      setListingType(type);
      setOriginalType(type);
      
      // Populate form data
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        make: listing.make || '',
        model: listing.model || '',
        year: listing.year || new Date().getFullYear(),
        price: type === 'sale' ? listing.price?.toString() || '' : '',
        pricePerDay: type === 'rental' ? listing.pricePerDay?.toString() || '' : '',
        mileage: listing.mileage?.toString() || '',
        condition: listing.condition || '',
        fuelType: listing.fuelType || '',
        transmission: listing.transmission || '',
        bodyType: listing.bodyType || '',
        category: listing.category || '',
        seats: listing.seats?.toString() || '',
        color: listing.color || '',
        location: listing.location || '',
        engineSize: listing.engineSize || '',
        minRentalDays: listing.minRentalDays?.toString() || '1',
        maxRentalDays: listing.maxRentalDays?.toString() || '',
        availableFrom: listing.availableFrom ? new Date(listing.availableFrom).toISOString().split('T')[0] : '',
        availableTo: listing.availableTo ? new Date(listing.availableTo).toISOString().split('T')[0] : '',
        listingPackage: listing.listingType || 'free',
        status: type === 'sale' ? listing.status : (listing.isDraft ? 'draft' : 'active')
      });
      
      // Parse features
      if (listing.features) {
        try {
          const features = typeof listing.features === 'string' 
            ? JSON.parse(listing.features) 
            : listing.features;
          setSelectedFeatures(Array.isArray(features) ? features : []);
        } catch (e) {
          setSelectedFeatures([]);
        }
      }
      
      // Parse images
      if (listing.images) {
        try {
          const imageUrls = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images;
          setExistingImages(Array.isArray(imageUrls) ? imageUrls : []);
        } catch (e) {
          setExistingImages([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching listing:', error);
      router.push('/dashboard/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    // Create previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          submitData.append(key, value.toString());
        }
      });
      
      // Set status based on save type
      submitData.set('status', saveAsDraft ? 'draft' : 'active');
      
      // Add features
      submitData.append('features', JSON.stringify(selectedFeatures));
      
      // Add existing images
      submitData.append('existingImages', JSON.stringify(existingImages));
      
      // Add new image files
      images.forEach((image, index) => {
        submitData.append(`image_${index}`, image);
      });
      
      // Determine endpoint based on listing type
      const endpoint = listingType === 'rental' 
        ? `/api/rental-listings/${params.id}`
        : `/api/listings/${params.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: submitData
      });
      
      if (response.ok) {
        router.push('/dashboard/listings');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
              <p className="mt-2 text-gray-600">Update your vehicle listing details</p>
            </div>
            <Link
              href="/dashboard/listings"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Listings
            </Link>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Listing Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Type</h2>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="listingType"
                  value="sale"
                  checked={listingType === 'sale'}
                  onChange={(e) => setListingType(e.target.value as 'sale' | 'rental')}
                  className="mr-2"
                  disabled={originalType !== listingType} // Prevent type change for now
                />
                <span className="text-gray-700">For Sale</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="listingType"
                  value="rental"
                  checked={listingType === 'rental'}
                  onChange={(e) => setListingType(e.target.value as 'sale' | 'rental')}
                  className="mr-2"
                  disabled={originalType !== listingType} // Prevent type change for now
                />
                <span className="text-gray-700">For Rent</span>
              </label>
            </div>
            {originalType !== listingType && (
              <p className="mt-2 text-sm text-amber-600">
                Note: Changing listing type is not supported. Create a new listing for different type.
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2020 Toyota Camry - Excellent Condition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Make</option>
                  {VEHICLE_MAKES.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Camry"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listingType === 'sale' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Day ($) *
                  </label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listingType === 'sale' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Condition</option>
                      {CONDITIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type
                    </label>
                    <select
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Body Type</option>
                      {BODY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {listingType === 'rental' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {RENTAL_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seats *
                    </label>
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Fuel Type</option>
                  {FUEL_TYPES.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Transmission</option>
                  {TRANSMISSION_TYPES.map(trans => (
                    <option key={trans} value={trans}>{trans}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Size
                </label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2.5L"
                />
              </div>
            </div>
          </div>

          {/* Rental Settings */}
          {listingType === 'rental' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rental Days
                  </label>
                  <input
                    type="number"
                    name="minRentalDays"
                    value={formData.minRentalDays}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Rental Days
                  </label>
                  <input
                    type="number"
                    name="maxRentalDays"
                    value={formData.maxRentalDays}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for no limit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available To
                  </label>
                  <input
                    type="date"
                    name="availableTo"
                    value={formData.availableTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide detailed information about the vehicle, its condition, maintenance history, and any special features..."
            />
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {COMMON_FEATURES.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Existing image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images */}
            {imagePreviews.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">New Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`New image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add More Images (Max 10 total)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={existingImages.length + images.length >= 10}
              />
              <p className="mt-2 text-sm text-gray-500">
                Current: {existingImages.length + images.length}/10 images
              </p>
            </div>
          </div>

          {/* Listing Package */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Package</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="listingPackage"
                  value="free"
                  checked={formData.listingPackage === 'free'}
                  onChange={handleInputChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Free Listing</div>
                  <div className="text-sm text-gray-500">Basic listing with standard visibility</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="listingPackage"
                  value="featured"
                  checked={formData.listingPackage === 'featured'}
                  onChange={handleInputChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Featured Listing - $29</div>
                  <div className="text-sm text-gray-500">Enhanced visibility and priority placement</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="listingPackage"
                  value="premium"
                  checked={formData.listingPackage === 'premium'}
                  onChange={handleInputChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Premium Listing - $59</div>
                  <div className="text-sm text-gray-500">Top placement and extended duration</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="listingPackage"
                  value="spotlight"
                  checked={formData.listingPackage === 'spotlight'}
                  onChange={handleInputChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Spotlight Listing - $99</div>
                  <div className="text-sm text-gray-500">Maximum exposure with homepage featuring</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save as Draft'}
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Update & Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}