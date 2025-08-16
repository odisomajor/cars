'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Copy,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Calendar,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  pricePerDay?: number;
  location: string;
  images: string;
  status: 'draft' | 'active' | 'inactive' | 'expired' | 'sold';
  listingType: 'free' | 'featured' | 'premium' | 'spotlight';
  views: number;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  type: 'sale' | 'rental';
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  sold: 'bg-blue-100 text-blue-800'
};

const LISTING_TYPE_COLORS = {
  free: 'bg-gray-100 text-gray-800',
  featured: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  spotlight: 'bg-yellow-100 text-yellow-800'
};

export default function ListingsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | 'feature' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [bulkActionProgress, setBulkActionProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchListings();
    }
  }, [status, currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        userOnly: 'true'
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/listings/manage?${params}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      
      const data = await response.json();
      setListings(data.listings || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectListing = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map(listing => listing.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedListings.length === 0) return;

    setIsLoading(true);
    setBulkActionProgress(0);
    
    try {
      // Process in batches for better performance
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < selectedListings.length; i += batchSize) {
        batches.push(selectedListings.slice(i, i + batchSize));
      }
      
      let processedCount = 0;
      const results = [];
      
      for (const batch of batches) {
        const response = await fetch('/api/listings/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            listingIds: batch
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          results.push(result);
          processedCount += batch.length;
          setBulkActionProgress((processedCount / selectedListings.length) * 100);
        } else {
          throw new Error(`Failed to process batch: ${response.statusText}`);
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      alert(`Successfully ${action}d ${selectedListings.length} listings`);
      setSelectedListings([]);
      setShowBulkActions(false);
      await fetchListings();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(`Failed to ${action} listings. Please try again.`);
    } finally {
      setIsLoading(false);
      setBulkActionProgress(0);
    }
  };

  const handleSingleAction = async (listingId: string, action: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error('Action failed');
      
      await fetchListings();
      setShowDropdown(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    }
  };

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      return imageArray[0] || '/placeholder-car.jpg';
    } catch {
      return '/placeholder-car.jpg';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600 mt-2">Manage your car listings and rental fleet</p>
            </div>
            <Link
              href="/create-listing"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="sold">Sold</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rental">For Rent</option>
              </select>
            </div>

            {selectedListings.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedListings.length} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Bulk Actions'}
                </button>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {showBulkActions && selectedListings.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction('unfeature')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unfeature
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  disabled={isLoading}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={selectedListings.length === 0 || isLoading}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Selected {selectedListings.length} listing{selectedListings.length !== 1 ? 's' : ''}
                </div>
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${bulkActionProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(bulkActionProgress)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedListings.length === listings.length && listings.length > 0}
                      onChange={handleSelectAll}
                      disabled={isLoading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => handleSelectListing(listing.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={getImageUrl(listing.images)}
                            alt={listing.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.year} {listing.make} {listing.model}
                          </div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {listing.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KSH {listing.type === 'rental' ? `${listing.pricePerDay?.toLocaleString()}/day` : listing.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[listing.status]}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${LISTING_TYPE_COLORS[listing.listingType]}`}>
                          {listing.listingType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {listing.type === 'rental' ? 'Rental' : 'Sale'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {listing.views}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {listing.contactCount}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === listing.id ? null : listing.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {showDropdown === listing.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <Link
                                href={`/listings/${listing.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                              <Link
                                href={`/create-listing?edit=${listing.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleSingleAction(listing.id, 'duplicate')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </button>
                              {listing.status === 'active' ? (
                                <button
                                  onClick={() => handleSingleAction(listing.id, 'deactivate')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSingleAction(listing.id, 'activate')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleSingleAction(listing.id, 'archive')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </button>
                              <button
                                onClick={() => handleSingleAction(listing.id, 'delete')}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listings.length === 0 && !loading && (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first listing to get started'}
              </p>
              <Link
                href="/create-listing"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}