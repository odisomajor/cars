'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  DollarSign, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Bell, 
  Megaphone,
  Calendar,
  Settings,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';

interface AdCampaign {
  id: string;
  name: string;
  type: 'banner' | 'native' | 'interstitial' | 'rewarded';
  status: 'active' | 'paused' | 'draft' | 'completed';
  budget: {
    total: number;
    spent: number;
    daily: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
  };
}

interface NotificationCampaign {
  id: string;
  name: string;
  type: 'listing' | 'booking' | 'payment' | 'system';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  scheduledDate?: string;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeSubscriptions: number;
  premiumListings: number;
  adRevenue: number;
  commissionRevenue: number;
}

export default function AdminPremiumDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([]);
  const [notifications, setNotifications] = useState<NotificationCampaign[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch ad campaigns
      const adsResponse = await fetch('/api/ads?type=campaigns');
      const adsData = await adsResponse.json();
      setAdCampaigns(adsData.campaigns || []);

      // Fetch notifications
      const notificationsResponse = await fetch('/api/notifications?type=campaigns');
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData.campaigns || []);

      // Fetch revenue data
      const revenueResponse = await fetch('/api/analytics/revenue');
      const revenue = await revenueResponse.json();
      setRevenueData(revenue);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'play' | 'pause' | 'delete') => {
    try {
      if (action === 'delete') {
        await fetch(`/api/ads?id=${campaignId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/ads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: campaignId, 
            status: action === 'play' ? 'active' : 'paused' 
          })
        });
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Features Dashboard</h1>
        <p className="text-gray-600">Manage advertising campaigns, notifications, and revenue analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="advertising">Advertising</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  +{revenueData?.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(revenueData?.activeSubscriptions || 0)}</div>
                <p className="text-xs text-muted-foreground">Premium subscribers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Listings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(revenueData?.premiumListings || 0)}</div>
                <p className="text-xs text-muted-foreground">Featured & spotlight</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData?.adRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Current advertising and notification campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ad Campaigns</span>
                    <Badge variant="secondary">{adCampaigns.filter(c => c.status === 'active').length} Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notification Campaigns</span>
                    <Badge variant="secondary">{notifications.filter(n => n.status === 'sent').length} Sent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Key metrics across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Impressions</span>
                    <span className="text-sm font-bold">
                      {formatNumber(adCampaigns.reduce((sum, c) => sum + c.performance.impressions, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Clicks</span>
                    <span className="text-sm font-bold">
                      {formatNumber(adCampaigns.reduce((sum, c) => sum + c.performance.clicks, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average CTR</span>
                    <span className="text-sm font-bold">
                      {(adCampaigns.reduce((sum, c) => sum + c.performance.ctr, 0) / adCampaigns.length || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advertising" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Advertising Campaigns</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="grid gap-6">
            {adCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {campaign.type} • Started {new Date(campaign.schedule.startDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCampaignAction(campaign.id, campaign.status === 'active' ? 'pause' : 'play')}
                      >
                        {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCampaignAction(campaign.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-2xl font-bold">{formatCurrency(campaign.budget.total)}</p>
                      <Progress 
                        value={(campaign.budget.spent / campaign.budget.total) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(campaign.budget.spent)} spent
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Impressions
                      </p>
                      <p className="text-2xl font-bold">{formatNumber(campaign.performance.impressions)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MousePointer className="h-4 w-4" /> Clicks
                      </p>
                      <p className="text-2xl font-bold">{formatNumber(campaign.performance.clicks)}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.performance.ctr}% CTR
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> Revenue
                      </p>
                      <p className="text-2xl font-bold">{formatCurrency(campaign.performance.revenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Notification Campaigns</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="grid gap-6">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        {notification.name}
                        <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                          {notification.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {notification.type} • {formatNumber(notification.recipients)} recipients
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Delivery Rate</p>
                      <p className="text-2xl font-bold">{notification.deliveryRate}%</p>
                      <Progress value={notification.deliveryRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Open Rate</p>
                      <p className="text-2xl font-bold">{notification.openRate}%</p>
                      <Progress value={notification.openRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Click Rate</p>
                      <p className="text-2xl font-bold">{notification.clickRate}%</p>
                      <Progress value={notification.clickRate} className="h-2" />
                    </div>
                  </div>
                  {notification.scheduledDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Scheduled for {new Date(notification.scheduledDate).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Current month performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(revenueData?.monthlyRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  +{revenueData?.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Revenue</CardTitle>
                <CardDescription>From transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(revenueData?.commissionRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advertising Revenue</CardTitle>
                <CardDescription>From ad campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(revenueData?.adRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue sources and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscription Revenue</span>
                  <span className="text-sm font-bold">{formatCurrency(50000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Premium Listing Fees</span>
                  <span className="text-sm font-bold">{formatCurrency(30000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transaction Commissions</span>
                  <span className="text-sm font-bold">{formatCurrency(25000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Advertising Revenue</span>
                  <span className="text-sm font-bold">{formatCurrency(20000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}