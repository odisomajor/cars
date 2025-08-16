import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Store active WebSocket connections
const clients = new Map<string, WebSocket>()
const vehicleSubscriptions = new Map<string, Set<string>>() // vehicleId -> Set of clientIds

// WebSocket message types
interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'availability_update' | 'booking_created' | 'booking_cancelled' | 'sync_conflict' | 'sync_status'
  vehicleId?: string
  vehicleIds?: string[]
  data?: any
}

// This is a simplified WebSocket implementation
// In a production environment, you might want to use a more robust solution
// like Socket.IO or a dedicated WebSocket service

export async function GET(request: NextRequest) {
  // WebSocket upgrade handling would typically be done at the server level
  // This is a placeholder for the WebSocket endpoint
  
  const { searchParams } = new URL(request.url)
  const upgrade = request.headers.get('upgrade')
  
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 })
  }
  
  // In a real implementation, you would handle the WebSocket upgrade here
  // For Next.js, this typically requires custom server setup
  
  return new Response('WebSocket endpoint - requires custom server setup', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Utility functions for WebSocket management
export class AvailabilityWebSocketManager {
  private static instance: AvailabilityWebSocketManager
  private wss: WebSocketServer | null = null
  private clients = new Map<string, any>()
  private vehicleSubscriptions = new Map<string, Set<string>>()
  
  static getInstance(): AvailabilityWebSocketManager {
    if (!AvailabilityWebSocketManager.instance) {
      AvailabilityWebSocketManager.instance = new AvailabilityWebSocketManager()
    }
    return AvailabilityWebSocketManager.instance
  }
  
  initialize(server: any) {
    this.wss = new WebSocketServer({ server })
    
    this.wss.on('connection', (ws: any, request: any) => {
      const clientId = this.generateClientId()
      this.clients.set(clientId, {
        ws,
        userId: null,
        subscribedVehicles: new Set()
      })
      
      ws.on('message', async (message: string) => {
        try {
          const data: WSMessage = JSON.parse(message)
          await this.handleMessage(clientId, data)
        } catch (error) {
          console.error('WebSocket message error:', error)
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }))
        }
      })
      
      ws.on('close', () => {
        this.handleDisconnect(clientId)
      })
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        message: 'Connected to availability sync service'
      }))
    })
  }
  
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async handleMessage(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId)
    if (!client) return
    
    switch (message.type) {
      case 'subscribe':
        await this.handleSubscribe(clientId, message)
        break
      case 'unsubscribe':
        await this.handleUnsubscribe(clientId, message)
        break
      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`
        }))
    }
  }
  
  private async handleSubscribe(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId)
    if (!client || !message.vehicleId) return
    
    const vehicleId = message.vehicleId
    
    // Add client to vehicle subscription
    if (!this.vehicleSubscriptions.has(vehicleId)) {
      this.vehicleSubscriptions.set(vehicleId, new Set())
    }
    this.vehicleSubscriptions.get(vehicleId)!.add(clientId)
    client.subscribedVehicles.add(vehicleId)
    
    // Send confirmation
    client.ws.send(JSON.stringify({
      type: 'subscribed',
      vehicleId,
      message: `Subscribed to availability updates for vehicle ${vehicleId}`
    }))
  }
  
  private async handleUnsubscribe(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId)
    if (!client || !message.vehicleId) return
    
    const vehicleId = message.vehicleId
    
    // Remove client from vehicle subscription
    const subscribers = this.vehicleSubscriptions.get(vehicleId)
    if (subscribers) {
      subscribers.delete(clientId)
      if (subscribers.size === 0) {
        this.vehicleSubscriptions.delete(vehicleId)
      }
    }
    client.subscribedVehicles.delete(vehicleId)
    
    // Send confirmation
    client.ws.send(JSON.stringify({
      type: 'unsubscribed',
      vehicleId,
      message: `Unsubscribed from availability updates for vehicle ${vehicleId}`
    }))
  }
  
  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return
    
    // Remove client from all vehicle subscriptions
    for (const vehicleId of client.subscribedVehicles) {
      const subscribers = this.vehicleSubscriptions.get(vehicleId)
      if (subscribers) {
        subscribers.delete(clientId)
        if (subscribers.size === 0) {
          this.vehicleSubscriptions.delete(vehicleId)
        }
      }
    }
    
    // Remove client
    this.clients.delete(clientId)
  }
  
  // Broadcast availability update to subscribed clients
  broadcastAvailabilityUpdate(vehicleId: string, availability: any) {
    const subscribers = this.vehicleSubscriptions.get(vehicleId)
    if (!subscribers) return
    
    const message = JSON.stringify({
      type: 'availability_update',
      vehicleId,
      availability,
      timestamp: new Date().toISOString()
    })
    
    for (const clientId of subscribers) {
      const client = this.clients.get(clientId)
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(message)
      }
    }
  }
  
  // Broadcast booking event to subscribed clients
  broadcastBookingEvent(vehicleId: string, eventType: 'created' | 'cancelled', booking: any) {
    const subscribers = this.vehicleSubscriptions.get(vehicleId)
    if (!subscribers) return
    
    const message = JSON.stringify({
      type: `booking_${eventType}`,
      vehicleId,
      booking,
      timestamp: new Date().toISOString()
    })
    
    for (const clientId of subscribers) {
      const client = this.clients.get(clientId)
      if (client && client.ws.readyState === 1) {
        client.ws.send(message)
      }
    }
  }
  
  // Broadcast sync conflict to subscribed clients
  broadcastSyncConflict(vehicleId: string, conflict: any) {
    const subscribers = this.vehicleSubscriptions.get(vehicleId)
    if (!subscribers) return
    
    const message = JSON.stringify({
      type: 'sync_conflict',
      vehicleId,
      conflict,
      timestamp: new Date().toISOString()
    })
    
    for (const clientId of subscribers) {
      const client = this.clients.get(clientId)
      if (client && client.ws.readyState === 1) {
        client.ws.send(message)
      }
    }
  }
  
  // Broadcast sync status update
  broadcastSyncStatus(vehicleIds: string[], status: any) {
    const message = JSON.stringify({
      type: 'sync_status',
      vehicleIds,
      status,
      timestamp: new Date().toISOString()
    })
    
    // Send to all clients subscribed to any of the vehicles
    const notifiedClients = new Set<string>()
    
    for (const vehicleId of vehicleIds) {
      const subscribers = this.vehicleSubscriptions.get(vehicleId)
      if (subscribers) {
        for (const clientId of subscribers) {
          if (!notifiedClients.has(clientId)) {
            const client = this.clients.get(clientId)
            if (client && client.ws.readyState === 1) {
              client.ws.send(message)
              notifiedClients.add(clientId)
            }
          }
        }
      }
    }
  }
  
  // Get connection statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      totalVehicleSubscriptions: this.vehicleSubscriptions.size,
      subscriptionDetails: Array.from(this.vehicleSubscriptions.entries()).map(([vehicleId, subscribers]) => ({
        vehicleId,
        subscriberCount: subscribers.size
      }))
    }
  }
}

// Export singleton instance
export const wsManager = AvailabilityWebSocketManager.getInstance()

// Helper functions for triggering WebSocket events from other parts of the application
export function notifyAvailabilityUpdate(vehicleId: string, availability: any) {
  wsManager.broadcastAvailabilityUpdate(vehicleId, availability)
}

export function notifyBookingEvent(vehicleId: string, eventType: 'created' | 'cancelled', booking: any) {
  wsManager.broadcastBookingEvent(vehicleId, eventType, booking)
}

export function notifySyncConflict(vehicleId: string, conflict: any) {
  wsManager.broadcastSyncConflict(vehicleId, conflict)
}

export function notifySyncStatus(vehicleIds: string[], status: any) {
  wsManager.broadcastSyncStatus(vehicleIds, status)
}