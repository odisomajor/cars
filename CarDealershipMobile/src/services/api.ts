import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'buyer' | 'dealer';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'buyer' | 'dealer';
  avatar?: string;
  createdAt: string;
}

interface CarListing {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  make: string;
  model: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  location: string;
  images: string[];
  features: string[];
  status: 'active' | 'pending' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  dealerId: string;
  createdAt: string;
  updatedAt: string;
}

interface SearchFilters {
  query?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  location?: string;
  page?: number;
  limit?: number;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem('authToken');
      } else {
        return await SecureStore.getItemAsync('authToken');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${API_BASE_URL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication APIs
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // User APIs
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Car Listings APIs
  async getListings(filters?: SearchFilters): Promise<ApiResponse<{ listings: CarListing[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    
    return this.makeRequest(endpoint);
  }

  async getListing(id: string): Promise<ApiResponse<CarListing>> {
    return this.makeRequest(`/listings/${id}`);
  }

  async getMyListings(): Promise<ApiResponse<CarListing[]>> {
    return this.makeRequest('/listings/my-listings');
  }

  async createListing(listingData: Omit<CarListing, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries'>): Promise<ApiResponse<CarListing>> {
    return this.makeRequest('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id: string, listingData: Partial<CarListing>): Promise<ApiResponse<CarListing>> {
    return this.makeRequest(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async searchListings(filters: SearchFilters): Promise<ApiResponse<{ listings: CarListing[]; total: number }>> {
    return this.getListings(filters);
  }

  // Featured/Recommended listings
  async getFeaturedListings(): Promise<ApiResponse<CarListing[]>> {
    return this.makeRequest('/listings/featured');
  }

  async getRecommendedListings(): Promise<ApiResponse<CarListing[]>> {
    return this.makeRequest('/listings/recommended');
  }

  // Bookings APIs
  async getBookings(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    
    const endpoint = searchParams.toString() ? `/mobile/bookings?${searchParams.toString()}` : '/mobile/bookings';
    return this.makeRequest(endpoint);
  }

  async getBooking(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/mobile/bookings/${id}`);
  }

  async createBooking(bookingData: {
    listingId: string;
    type: 'viewing' | 'test_drive';
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/mobile/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, bookingData: {
    status?: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest(`/mobile/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/mobile/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile APIs
  async updateProfile(profileData: {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
    avatar?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/mobile/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Notification Settings APIs
  async getNotificationSettings(): Promise<ApiResponse<any>> {
    return this.makeRequest('/mobile/notifications/settings');
  }

  async updateNotificationSettings(settings: any): Promise<ApiResponse> {
    return this.makeRequest('/mobile/notifications/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Analytics APIs (for dealers)
  async getDealerAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/analytics/dealer');
  }

  async getListingAnalytics(listingId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/analytics/listings/${listingId}`);
  }

  // Notifications APIs
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async updateNotificationSettings(settings: any): Promise<ApiResponse> {
    return this.makeRequest('/notifications/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Favorites APIs
  async getFavorites(): Promise<ApiResponse<CarListing[]>> {
    return this.makeRequest('/favorites');
  }

  async addToFavorites(listingId: string): Promise<ApiResponse> {
    return this.makeRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  }

  async removeFromFavorites(listingId: string): Promise<ApiResponse> {
    return this.makeRequest(`/favorites/${listingId}`, {
      method: 'DELETE',
    });
  }

  // Messages/Inquiries APIs
  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/messages/conversations');
  }

  async getMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest(`/messages/conversations/${conversationId}`);
  }

  async sendMessage(conversationId: string, message: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async createInquiry(listingId: string, message: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/messages/inquiries', {
      method: 'POST',
      body: JSON.stringify({ listingId, message }),
    });
  }

  // File Upload APIs
  async uploadImage(imageUri: string, type: 'avatar' | 'listing'): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
      formData.append('type', type);

      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Utility methods
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  User,
  CarListing,
  SearchFilters,
};