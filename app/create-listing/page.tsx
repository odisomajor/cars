'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, X, Plus, Car, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ListingFormData {
  type: 'sale' | 'rental';
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  price: number;
  pricePerDay?: number;
  mileage?: number;
  condition: string;
  fuelType: string;
  transmission: string;
  bodyType?: string;
  category?: string;
  color: string;
  location: string;
  engineSize: string;
  seats?: number;
  features: string[];
  images: File[];
  listingType: string;
  minRentalDays?: number;
  maxRentalDays?: number;
  availableFrom?: string;
  availableTo?: string;
}

const MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet',
  'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Land Rover', 'Jeep', 'Other'
];

const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG'];
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'CVT'];
const CONDITIONS = ['NEW', 'USED', 'CERTIFIED_PRE_OWNED'];
const BODY_TYPES = ['SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'CONVERTIBLE', 'WAGON', 'PICKUP', 'VAN', 'MINIVAN'];
const RENTAL_CATEGORIES = ['ECONOMY', 'COMPACT', 'MIDSIZE', 'FULLSIZE', 'SUV', 'LUXURY', 'VAN', 'PICKUP'];
const LISTING_TYPES = [
  { value: 'free', label: 'Free Listing', description: 'Basic listing with standard visibility' },
  { value: 'featured', label: 'Featured Listing', description: 'Priority in search results - $10/month (Sales) or $15/month (Rentals)' },
  { value: 'premium', label: 'Premium Listing', description: 'Homepage carousel + social promotion - $25/month (Sales) or $35/month (Rentals)' },
  { value: 'spotlight', label: 'Spotlight Listing', description: 'Top placement + featured badge - $50/month (Sales) or $60/month (Rentals)' }
];

const COMMON_FEATURES = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
  'ABS', 'Airbags', 'Alloy Wheels', 'Fog Lights', 'Sunroof', 'Leather Seats',
  'Bluetooth', 'USB Port', 'Aux Input', 'CD Player', 'Radio', 'Navigation System',
  'Backup Camera', 'Parking Sensors', 'Cruise Control', 'Keyless Entry'
];

export default function CreateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<ListingFormData>({
    type: 'sale',
    title: '',
    description: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    condition: 'USED',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    color: '',
    location: '',
    engineSize: '',
    features: [],
    images: [],
    listingType: 'free'
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'price' || name === 'mileage' || name === 'seats' || name === 'pricePerDay' || name === 'minRentalDays' || name === 'maxRentalDays'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach(image => {
            submitData.append('images', image);
          });
        } else if (key === 'features') {
          submitData.append('features', JSON.stringify(value));
        } else {
          submitData.append(key, value?.toString() || '');
        }
      });

      const endpoint = formData.type === 'sale' ? '/api/listings' : '/api/rental-listings';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const result = await response.json();
      router.push(`/dashboard?tab=listings&success=created`);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600 mt-2">List your car for sale or rent on Kenya's premier marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Listing Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                formData.type === 'sale' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="sale"
                  checked={formData.type === 'sale'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Car Sale</div>
                    <div className="text-sm text-gray-500">Sell your car to buyers</div>
                  </div>
                </div>
              </label>
              
              <label className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                formData.type === 'rental' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="rental"
                  checked={formData.type === 'rental'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Car Rental</div>
                    <div className="text-sm text-gray-500">Rent your car to customers</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020 Toyota Camry - Excellent Condition"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Make</option>
                  {MAKES.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {formData.type === 'sale' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSH)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (KSH)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.type === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {formData.type === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CONDITIONS.map(condition => (
                      <option key={condition} value={condition}>{condition.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.type === 'rental' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {RENTAL_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {FUEL_TYPES.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {TRANSMISSIONS.map(trans => (
                    <option key={trans} value={trans}>{trans}</option>
                  ))}
                </select>
              </div>
              
              {formData.type === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
                  <select
                    name="bodyType"
                    value={formData.bodyType || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Body Type</option>
                    {BODY_TYPES.map(body => (
                      <option key={body} value={body}>{body}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.type === 'rental' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                  <input
                    type="number"
                    name="seats"
                    value={formData.seats || 0}
                    onChange={handleInputChange}
                    min="2"
                    max="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., White"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Nairobi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine Size</label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.0L"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rental Specific Fields */}
          {formData.type === 'rental' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rental Days</label>
                  <input
                    type="number"
                    name="minRentalDays"
                    value={formData.minRentalDays || 1}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Rental Days</label>
                  <input
                    type="number"
                    name="maxRentalDays"
                    value={formData.maxRentalDays || 0}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available To</label>
                  <input
                    type="date"
                    name="availableTo"
                    value={formData.availableTo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Describe your vehicle in detail. Include any special features, maintenance history, or other relevant information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
                    checked={formData.features.includes(feature)}
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
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10 images)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Listing Package */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Package</h2>
            <div className="space-y-4">
              {LISTING_TYPES.map(type => (
                <label key={type.value} className={`cursor-pointer border-2 rounded-lg p-4 block transition-colors ${
                  formData.listingType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="listingType"
                    value={type.value}
                    checked={formData.listingType === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                    </div>
                    {type.value === 'free' && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Free</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : `Create ${formData.type === 'sale' ? 'Sale' : 'Rental'} Listing`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}