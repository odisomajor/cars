'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Tag, Clock, BarChart3, Users, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategoryManager from '@/components/listings/CategoryManager';
import ExpirationManager from '@/components/listings/ExpirationManager';
import RentalFleetDashboard from '@/components/rental/RentalFleetDashboard';
import RentalPricingCalendar from '@/components/rental/RentalPricingCalendar';
import RentalTermsSetup from '@/components/rental/RentalTermsSetup';

export default function AdminListingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true);
  const [activeTab, setActiveTab] = useState('categories');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">Please log in to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
              <p className="text-gray-600">You need administrator privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Listing Management</h1>
          </div>
          <p className="text-gray-600">
            Manage categories, monitor expirations, and configure rental settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
                <Car className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rental Fleet</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="expiration" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Expiration</span>
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Fleet</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Terms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Category Management</h2>
                <p className="text-gray-600 mt-1">
                  Create and manage listing categories and subcategories
                </p>
              </div>
            </div>
            <CategoryManager />
          </TabsContent>

          <TabsContent value="expiration" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Listing Expiration</h2>
                <p className="text-gray-600 mt-1">
                  Monitor and manage listing expirations across all users
                </p>
              </div>
            </div>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This shows expiring listings for the current admin user. In a production environment, 
                this would show system-wide expiring listings.
              </AlertDescription>
            </Alert>
            <ExpirationManager userId={user.id} />
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Rental Fleet Management</h2>
                <p className="text-gray-600 mt-1">
                  Manage rental vehicle fleet, availability, and maintenance
                </p>
              </div>
            </div>
            <RentalFleetDashboard />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Rental Pricing Calendar</h2>
                <p className="text-gray-600 mt-1">
                  Set dynamic pricing rules and manage rental availability
                </p>
              </div>
            </div>
            <RentalPricingCalendar />
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Rental Terms Setup</h2>
                <p className="text-gray-600 mt-1">
                  Configure rental policies, terms, and conditions
                </p>
              </div>
            </div>
            <RentalTermsSetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}