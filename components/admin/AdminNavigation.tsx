"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Car,
  BarChart3,
  FileText,
  Shield,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Listing Moderation",
    href: "/admin/moderation",
    icon: Shield
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3
  },
  {
    name: "Content Management",
    href: "/admin/content",
    icon: FileText
  },
  {
    name: "Listings",
    href: "/admin/listings",
    icon: Car
  },
  {
    name: "Premium Features",
    href: "/admin/premium",
    icon: Settings
  }
]

interface AdminNavigationProps {
  className?: string
}

export default function AdminNavigation({ className = "" }: AdminNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const NavigationItems = ({ items, level = 0 }: { items: NavigationItem[], level?: number }) => (
    <>
      {items.map((item) => {
        const isItemActive = isActive(item.href)
        const isExpanded = expandedItems.includes(item.name)
        const hasChildren = item.children && item.children.length > 0

        return (
          <div key={item.name}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isItemActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${level > 0 ? "ml-4" : ""}`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isItemActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${level > 0 ? "ml-4" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )}
            
            {hasChildren && isExpanded && (
              <div className="mt-1">
                <NavigationItems items={item.children!} level={level + 1} />
              </div>
            )}
          </div>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavigationItems items={navigation} />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="w-5 h-5 mr-3 rotate-180" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  )
}