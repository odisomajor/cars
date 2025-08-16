'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExpiringListing {
  id: string;
  title: string;
  expiresAt: string;
  listingType: string;
  type: 'listing' | 'rental';
}

interface ExpirationManagerProps {
  userId: string;
  className?: string;
}

const ExpirationManager: React.FC<ExpirationManagerProps> = ({ userId, className = '' }) => {
  const [expiringSoon, setExpiringSoon] = useState<ExpiringListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState<string | null>(null);

  useEffect(() => {
    fetchExpiringSoon();
  }, [userId]);

  const fetchExpiringSoon = async () => {
    try {
      const response = await fetch(`/api/listings/expire?userId=${userId}&days=14`);
      if (response.ok) {
        const data = await response.json();
        const combined = [
          ...data.expiringSoon.listings.map((l: any) => ({ ...l, type: 'listing' })),
          ...data.expiringSoon.rentalListings.map((l: any) => ({ ...l, type: 'rental' }))
        ];
        setExpiringSoon(combined);
      }
    } catch (error) {
      console.error('Error fetching expiring listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const extendListing = async (listingId: string, type: 'listing' | 'rental') => {
    setExtending(listingId);
    try {
      const endpoint = type === 'rental' ? 'rental-listings' : 'listings';
      const response = await fetch(`/api/${endpoint}/${listingId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }) // Extend by 30 days
      });

      if (response.ok) {
        await fetchExpiringSoon(); // Refresh the list
      } else {
        alert('Failed to extend listing');
      }
    } catch (error) {
      console.error('Error extending listing:', error);
      alert('Failed to extend listing');
    } finally {
      setExtending(null);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'default';
    return 'secondary';
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 1) return <AlertTriangle className="w-4 h-4" />;
    if (days <= 3) return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Listing Expiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringSoon.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Listing Expiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No listings expiring soon</p>
            <p className="text-sm">All your listings are active for more than 14 days</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Listing Expiration
          </div>
          <Badge variant="outline">
            {expiringSoon.length} expiring soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expiringSoon.some(listing => getDaysUntilExpiry(listing.expiresAt) <= 3) && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have listings expiring within 3 days. Consider extending them to maintain visibility.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {expiringSoon.map((listing) => {
            const daysLeft = getDaysUntilExpiry(listing.expiresAt);
            const urgencyColor = getUrgencyColor(daysLeft);
            const urgencyIcon = getUrgencyIcon(daysLeft);

            return (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h4 className="font-medium text-sm truncate max-w-[200px]">
                      {listing.title}
                    </h4>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {listing.type === 'rental' ? 'Rental' : 'Sale'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    {urgencyIcon}
                    <span className="ml-1">
                      {daysLeft <= 0 ? 'Expired' : 
                       daysLeft === 1 ? '1 day left' : 
                       `${daysLeft} days left`}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Expires {new Date(listing.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={urgencyColor} className="text-xs">
                    {daysLeft <= 0 ? 'Expired' :
                     daysLeft <= 1 ? 'Critical' :
                     daysLeft <= 3 ? 'Urgent' :
                     daysLeft <= 7 ? 'Soon' : 'Upcoming'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => extendListing(listing.id, listing.type)}
                    disabled={extending === listing.id}
                    className="text-xs"
                  >
                    {extending === listing.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Extend
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Showing listings expiring within 14 days</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchExpiringSoon}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpirationManager;