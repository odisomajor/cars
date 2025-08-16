'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  Home, 
  Car, 
  Search, 
  Heart, 
  User, 
  Settings, 
  Bell, 
  MessageSquare, 
  CreditCard, 
  BarChart3,
  X,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  description?: string
}

interface MobileNavigationProps {
  className?: string
  user?: {
    name: string
    email: string
    avatar?: string
    isPremium?: boolean
  }
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="h-5 w-5" />,
      description: 'Browse featured cars'
    },
    {
      label: 'Search',
      href: '/search',
      icon: <Search className="h-5 w-5" />,
      description: 'Find your perfect car'
    },
    {
      label: 'My Cars',
      href: '/my-cars',
      icon: <Car className="h-5 w-5" />,
      description: 'Manage your listings'
    },
    {
      label: 'Favorites',
      href: '/favorites',
      icon: <Heart className="h-5 w-5" />,
      badge: 3,
      description: 'Saved cars'
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 2,
      description: 'Chat with buyers/sellers'
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'View your performance'
    },
    {
      label: 'Payments',
      href: '/payments',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Billing & transactions'
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: 5,
      description: 'Recent updates'
    }
  ]

  const quickActions = [
    {
      label: 'Sell a Car',
      href: '/sell',
      className: 'bg-primary text-primary-foreground hover:bg-primary/90'
    },
    {
      label: 'Get Premium',
      href: '/premium',
      className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Navigation Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn('md:hidden', className)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                  <SheetDescription className="text-left">
                    Access all features
                  </SheetDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {/* User Profile Section */}
            {user && (
              <div className="p-6 border-b bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      {user.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-6 border-b">
              <h3 className="font-medium text-sm mb-3 text-muted-foreground">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href} onClick={() => setIsOpen(false)}>
                    <Button className={cn('w-full justify-start', action.className)}>
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h3 className="font-medium text-sm mb-3 text-muted-foreground">Menu</h3>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg transition-colors',
                        'hover:bg-muted/50',
                        isActive(item.href) 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <div>
                          <div className="font-medium text-sm">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && item.badge > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t">
              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                'flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors',
                isActive(item.href) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export default MobileNavigation