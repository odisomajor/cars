// Notification Components
export { default as PushNotificationSystem } from './PushNotificationSystem'

// Notification Types
export interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  image?: string
  badge?: string
  data?: {
    url?: string
    action?: string
    [key: string]: any
  }
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
  timestamp: Date
  expirationTime?: Date
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  tags?: string[]
  silent?: boolean
  requireInteraction?: boolean
}

export interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  icon?: string
  image?: string
  variables: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
  usage: {
    sent: number
    opened: number
    clicked: number
  }
}

export interface NotificationCampaign {
  id: string
  name: string
  templateId: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  audience: {
    type: 'all' | 'segment' | 'custom'
    criteria?: {
      userType?: string[]
      location?: string[]
      subscriptionPlan?: string[]
      lastActivity?: {
        days: number
        operator: 'within' | 'after'
      }
      [key: string]: any
    }
    userIds?: string[]
    estimatedReach: number
  }
  scheduling: {
    type: 'immediate' | 'scheduled' | 'recurring'
    sendAt?: Date
    timezone?: string
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly'
      interval: number
      endDate?: Date
    }
  }
  content: {
    title: string
    body: string
    icon?: string
    image?: string
    url?: string
    variables?: { [key: string]: string }
  }
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
    unsubscribed: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface NotificationPreferences {
  userId: string
  enabled: boolean
  types: {
    [key: string]: {
      enabled: boolean
      channels: ('push' | 'email' | 'sms')[]
    }
  }
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
    timezone: string
  }
  frequency: {
    marketing: 'immediate' | 'daily' | 'weekly' | 'never'
    transactional: 'immediate' | 'batched'
    reminders: 'immediate' | 'daily' | 'never'
  }
  updatedAt: Date
}

export interface NotificationStats {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalFailed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  failureRate: number
  averageDeliveryTime: number
  topPerformingTemplates: {
    templateId: string
    name: string
    openRate: number
    clickRate: number
  }[]
  deviceBreakdown: {
    platform: string
    count: number
    percentage: number
  }[]
  timeDistribution: {
    hour: number
    sent: number
    opened: number
  }[]
}

export interface NotificationDevice {
  id: string
  userId: string
  token: string
  platform: 'web' | 'ios' | 'android'
  browser?: string
  os?: string
  model?: string
  active: boolean
  lastSeen: Date
  createdAt: Date
}

// Notification Constants
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export const NOTIFICATION_CATEGORIES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  LISTING: 'listing',
  MARKETING: 'marketing',
  SYSTEM: 'system',
  REMINDER: 'reminder',
  SOCIAL: 'social',
  SECURITY: 'security'
} as const

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const

export const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms'
} as const

export const DEFAULT_NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: {
    name: 'Booking Confirmed',
    category: NOTIFICATION_CATEGORIES.BOOKING,
    defaultEnabled: true,
    channels: ['push', 'email']
  },
  BOOKING_REMINDER: {
    name: 'Booking Reminder',
    category: NOTIFICATION_CATEGORIES.REMINDER,
    defaultEnabled: true,
    channels: ['push', 'email']
  },
  PAYMENT_RECEIVED: {
    name: 'Payment Received',
    category: NOTIFICATION_CATEGORIES.PAYMENT,
    defaultEnabled: true,
    channels: ['push', 'email']
  },
  LISTING_APPROVED: {
    name: 'Listing Approved',
    category: NOTIFICATION_CATEGORIES.LISTING,
    defaultEnabled: true,
    channels: ['push', 'email']
  },
  MARKETING_OFFERS: {
    name: 'Marketing Offers',
    category: NOTIFICATION_CATEGORIES.MARKETING,
    defaultEnabled: false,
    channels: ['push', 'email']
  },
  SYSTEM_UPDATES: {
    name: 'System Updates',
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    defaultEnabled: true,
    channels: ['push', 'email']
  }
} as const

// Utility Functions
export const formatNotificationTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return '#6B7280'
    case 'normal':
      return '#3B82F6'
    case 'high':
      return '#F59E0B'
    case 'urgent':
      return '#EF4444'
    default:
      return '#6B7280'
  }
}

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'booking':
      return '📅'
    case 'payment':
      return '💳'
    case 'listing':
      return '🚗'
    case 'marketing':
      return '📢'
    case 'system':
      return '⚙️'
    case 'reminder':
      return '⏰'
    case 'social':
      return '👥'
    case 'security':
      return '🔒'
    default:
      return '🔔'
  }
}

export const calculateDeliveryRate = (delivered: number, sent: number): number => {
  return sent > 0 ? (delivered / sent) * 100 : 0
}

export const calculateOpenRate = (opened: number, delivered: number): number => {
  return delivered > 0 ? (opened / delivered) * 100 : 0
}

export const calculateClickRate = (clicked: number, opened: number): number => {
  return opened > 0 ? (clicked / opened) * 100 : 0
}

export const calculateFailureRate = (failed: number, sent: number): number => {
  return sent > 0 ? (failed / sent) * 100 : 0
}

export const isInQuietHours = (preferences: NotificationPreferences): boolean => {
  if (!preferences.quietHours.enabled) return false
  
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const { start, end } = preferences.quietHours
  
  if (start <= end) {
    return currentTime >= start && currentTime <= end
  } else {
    // Quiet hours span midnight
    return currentTime >= start || currentTime <= end
  }
}

export const shouldSendNotification = (
  notificationType: string,
  preferences: NotificationPreferences,
  channel: 'push' | 'email' | 'sms' = 'push'
): boolean => {
  if (!preferences.enabled) return false
  
  const typePrefs = preferences.types[notificationType]
  if (!typePrefs || !typePrefs.enabled) return false
  
  if (!typePrefs.channels.includes(channel)) return false
  
  // Check quiet hours for non-urgent notifications
  if (channel === 'push' && isInQuietHours(preferences)) {
    return false
  }
  
  return true
}

export const interpolateTemplate = (
  template: string,
  variables: { [key: string]: string }
): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

export const extractTemplateVariables = (template: string): string[] => {
  const matches = template.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []
  
  return matches.map(match => match.replace(/[{}]/g, ''))
}

export const validateNotificationContent = (notification: Partial<PushNotification>): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (notification.title.length > 100) {
    errors.push('Title must be 100 characters or less')
  }
  
  if (!notification.body || notification.body.trim().length === 0) {
    errors.push('Body is required')
  } else if (notification.body.length > 500) {
    errors.push('Body must be 500 characters or less')
  }
  
  if (notification.actions && notification.actions.length > 3) {
    errors.push('Maximum 3 actions allowed')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export const generateMockNotifications = (count: number = 20): PushNotification[] => {
  const notifications: PushNotification[] = []
  const categories = Object.values(NOTIFICATION_CATEGORIES)
  const priorities = Object.values(NOTIFICATION_PRIORITIES)
  
  const templates = [
    { title: 'Booking Confirmed', body: 'Your rental booking for {{vehicle}} has been confirmed for {{date}}' },
    { title: 'Payment Received', body: 'We\'ve received your payment of {{amount}} for booking {{reference}}' },
    { title: 'New Message', body: 'You have a new message from {{sender}} about {{vehicle}}' },
    { title: 'Listing Approved', body: 'Your listing for {{vehicle}} has been approved and is now live' },
    { title: 'Special Offer', body: 'Get {{discount}}% off your next rental. Limited time offer!' },
    { title: 'Reminder', body: 'Don\'t forget about your upcoming rental pickup tomorrow at {{time}}' }
  ]
  
  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const timestamp = new Date()
    timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 10080)) // Random time in last week
    
    notifications.push({
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      body: interpolateTemplate(template.body, {
        vehicle: `${['Toyota', 'Honda', 'BMW', 'Mercedes'][Math.floor(Math.random() * 4)]} ${['Camry', 'Civic', 'X5', 'C-Class'][Math.floor(Math.random() * 4)]}`,
        date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        amount: `$${Math.floor(Math.random() * 500 + 100)}`,
        reference: `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        sender: `${['John', 'Sarah', 'Mike', 'Emma'][Math.floor(Math.random() * 4)]} ${['Smith', 'Johnson', 'Brown', 'Davis'][Math.floor(Math.random() * 4)]}`,
        discount: `${Math.floor(Math.random() * 30 + 10)}`,
        time: `${Math.floor(Math.random() * 12 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`
      }),
      icon: '/icons/notification-icon.png',
      timestamp,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      data: {
        url: '/dashboard',
        action: 'view_details'
      }
    })
  }
  
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const generateMockTemplates = (): NotificationTemplate[] => {
  return [
    {
      id: 'template_booking_confirmed',
      name: 'Booking Confirmed',
      title: 'Booking Confirmed',
      body: 'Your rental booking for {{vehicle}} has been confirmed for {{date}}. Pickup location: {{location}}',
      category: 'booking',
      priority: 'high',
      icon: '/icons/booking-confirmed.png',
      variables: ['vehicle', 'date', 'location'],
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      usage: { sent: 1250, opened: 980, clicked: 450 }
    },
    {
      id: 'template_payment_received',
      name: 'Payment Received',
      title: 'Payment Received',
      body: 'We\'ve received your payment of {{amount}} for booking {{reference}}. Thank you!',
      category: 'payment',
      priority: 'normal',
      icon: '/icons/payment-received.png',
      variables: ['amount', 'reference'],
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      usage: { sent: 890, opened: 720, clicked: 320 }
    },
    {
      id: 'template_marketing_offer',
      name: 'Special Offer',
      title: 'Special Offer Just for You!',
      body: 'Get {{discount}}% off your next rental. Use code {{code}} before {{expiry}}',
      category: 'marketing',
      priority: 'low',
      icon: '/icons/special-offer.png',
      variables: ['discount', 'code', 'expiry'],
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      usage: { sent: 2100, opened: 1200, clicked: 180 }
    }
  ]
}

export const generateMockPreferences = (userId: string): NotificationPreferences => {
  return {
    userId,
    enabled: true,
    types: Object.entries(DEFAULT_NOTIFICATION_TYPES).reduce((acc, [key, config]) => {
      acc[key] = {
        enabled: config.defaultEnabled,
        channels: config.channels as ('push' | 'email' | 'sms')[]
      }
      return acc
    }, {} as { [key: string]: { enabled: boolean; channels: ('push' | 'email' | 'sms')[] } }),
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York'
    },
    frequency: {
      marketing: 'weekly',
      transactional: 'immediate',
      reminders: 'daily'
    },
    updatedAt: new Date()
  }
}