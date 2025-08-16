import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, CarListing, SearchFilters, User } from '../services/api';
import { Alert } from 'react-native';

// Query Keys
export const queryKeys = {
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  myListings: ['listings', 'my'] as const,
  featuredListings: ['listings', 'featured'] as const,
  recommendedListings: ['listings', 'recommended'] as const,
  searchListings: (filters: SearchFilters) => ['listings', 'search', filters] as const,
  dealers: ['dealers'] as const,
  dealer: (id: string) => ['dealers', id] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  profile: ['profile'] as const,
  notifications: ['notifications'] as const,
  favorites: ['favorites'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  analytics: ['analytics'] as const,
  dealerAnalytics: ['analytics', 'dealer'] as const,
  listingAnalytics: (listingId: string) => ['analytics', 'listings', listingId] as const,
};}

// Listings Hooks
export const useListings = (filters?: SearchFilters) => {
  return useQuery({
    queryKey: filters ? queryKeys.searchListings(filters) : queryKeys.listings,
    queryFn: () => apiService.getListings(filters),
    select: (data) => data.success ? data.data : { listings: [], total: 0 },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => apiService.getListing(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: queryKeys.myListings,
    queryFn: () => apiService.getMyListings(),
    select: (data) => data.success ? data.data : [],
  });
};

export const useFeaturedListings = () => {
  return useQuery({
    queryKey: queryKeys.featuredListings,
    queryFn: () => apiService.getFeaturedListings(),
    select: (data) => data.success ? data.data : [],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecommendedListings = () => {
  return useQuery({
    queryKey: queryKeys.recommendedListings,
    queryFn: () => apiService.getRecommendedListings(),
    select: (data) => data.success ? data.data : [],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Listing Mutations
export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingData: Omit<CarListing, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries'>) => 
      apiService.createListing(listingData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
        queryClient.invalidateQueries({ queryKey: queryKeys.listings });
        Alert.alert('Success', 'Listing created successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to create listing');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create listing');
      console.error('Create listing error:', error);
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarListing> }) => 
      apiService.updateListing(id, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.listing(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
        queryClient.invalidateQueries({ queryKey: queryKeys.listings });
        Alert.alert('Success', 'Listing updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update listing');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update listing');
      console.error('Update listing error:', error);
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteListing(id),
    onSuccess: (data, id) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
        queryClient.invalidateQueries({ queryKey: queryKeys.listings });
        queryClient.removeQueries({ queryKey: queryKeys.listing(id) });
        Alert.alert('Success', 'Listing deleted successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to delete listing');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to delete listing');
      console.error('Delete listing error:', error);
    },
  });
};

// Bookings Hooks
export const useBookings = (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
  return useQuery({
    queryKey: params ? [...queryKeys.bookings, params] : queryKeys.bookings,
    queryFn: () => apiService.getBookings(params),
    select: (data) => data.success ? data.data : [],
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => apiService.getBooking(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingData: {
      listingId: string;
      type: 'viewing' | 'test_drive';
      scheduledDate: string;
      scheduledTime: string;
      notes?: string;
    }) => apiService.createBooking(bookingData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        Alert.alert('Success', 'Booking created successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to create booking');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create booking');
      console.error('Create booking error:', error);
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      status?: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
      notes?: string;
    }}) => apiService.updateBooking(id, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.booking(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        Alert.alert('Success', 'Booking updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update booking');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update booking');
      console.error('Update booking error:', error);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.cancelBooking(id),
    onSuccess: (data, id) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        Alert.alert('Success', 'Booking cancelled successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to cancel booking');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to cancel booking');
      console.error('Cancel booking error:', error);
    },
  });
};

// Profile Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiService.getProfile(),
    select: (data) => data.success ? data.data : null,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Partial<User>) => apiService.updateProfile(userData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update profile error:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => 
      apiService.changePassword(oldPassword, newPassword),
    onSuccess: (data) => {
      if (data.success) {
        Alert.alert('Success', 'Password changed successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to change password');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to change password');
      console.error('Change password error:', error);
    },
  });
};

// Favorites Hooks
export const useFavorites = () => {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => apiService.getFavorites(),
    select: (data) => data.success ? data.data : [],
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, isFavorite }: { listingId: string; isFavorite: boolean }) => {
      return isFavorite 
        ? apiService.removeFromFavorites(listingId)
        : apiService.addToFavorites(listingId);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
        const action = variables.isFavorite ? 'removed from' : 'added to';
        Alert.alert('Success', `Listing ${action} favorites!`);
      } else {
        Alert.alert('Error', data.error || 'Failed to update favorites');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update favorites');
      console.error('Toggle favorite error:', error);
    },
  });
};

// Notifications Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => apiService.getNotifications(),
    select: (data) => data.success ? data.data : [],
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.markNotificationAsRead(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      }
    },
    onError: (error) => {
      console.error('Mark notification as read error:', error);
    },
  });
};

// Messages Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => apiService.getConversations(),
    select: (data) => data.success ? data.data : [],
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => apiService.getMessages(conversationId),
    select: (data) => data.success ? data.data : [],
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) => 
      apiService.sendMessage(conversationId, message),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      } else {
        Alert.alert('Error', data.error || 'Failed to send message');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to send message');
      console.error('Send message error:', error);
    },
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, message }: { listingId: string; message: string }) => 
      apiService.createInquiry(listingId, message),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        Alert.alert('Success', 'Inquiry sent successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to send inquiry');
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to send inquiry');
      console.error('Create inquiry error:', error);
    },
  });
};

// Analytics Hooks (for dealers)
export const useDealerAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.dealerAnalytics,
    queryFn: () => apiService.getDealerAnalytics(),
    select: (data) => data.success ? data.data : null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useListingAnalytics = (listingId: string) => {
  return useQuery({
    queryKey: queryKeys.listingAnalytics(listingId),
    queryFn: () => apiService.getListingAnalytics(listingId),
    select: (data) => data.success ? data.data : null,
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// File Upload Hook
export const useUploadImage = () => {
  return useMutation({
    mutationFn: ({ imageUri, type }: { imageUri: string; type: 'avatar' | 'listing' }) => 
      apiService.uploadImage(imageUri, type),
    onError: (error) => {
      Alert.alert('Error', 'Failed to upload image');
      console.error('Upload image error:', error);
    },
  });
};

// Connection Check Hook
export const useConnectionCheck = () => {
  return useQuery({
    queryKey: ['connection'],
    queryFn: () => apiService.checkConnection(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });
};