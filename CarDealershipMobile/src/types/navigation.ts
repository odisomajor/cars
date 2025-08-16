export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ListingDetails: { listingId: string };
  CreateListing: undefined;
  EditListing: { listingId: string };
  BookingDetails: { bookingId: string };
  Chat: { conversationId: string };
  UserProfile: { userId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Listings: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type ListingsStackParamList = {
  MyListings: undefined;
  CreateListing: undefined;
  EditListing: { listingId: string };
  ListingDetails: { listingId: string };
};

export type SearchStackParamList = {
  SearchHome: undefined;
  SearchResults: { query: string; filters?: any };
  ListingDetails: { listingId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Help: undefined;
};

export type BookingsStackParamList = {
  BookingsList: undefined;
  BookingDetails: { bookingId: string };
  CreateBooking: { listingId: string };
};