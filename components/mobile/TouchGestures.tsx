'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TouchGestureProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  disabled?: boolean
}

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

const TouchGestures: React.FC<TouchGestureProps> = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false
}) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null)
  const [touchEnd, setTouchEnd] = useState<TouchPoint | null>(null)
  const [lastTap, setLastTap] = useState<TouchPoint | null>(null)
  const [initialDistance, setInitialDistance] = useState<number | null>(null)
  const [currentScale, setCurrentScale] = useState(1)
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    setTouchStart(touchPoint)
    setTouchEnd(null)

    // Handle multi-touch for pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const distance = getDistance(e.touches[0], e.touches[1])
      setInitialDistance(distance)
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }, [disabled, onPinch, onLongPress, longPressDelay, getDistance])

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled) return

    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialDistance) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialDistance
      setCurrentScale(scale)
      onPinch(scale)
    }
  }, [disabled, onPinch, initialDistance, getDistance])

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const touch = e.changedTouches[0]
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    setTouchEnd(touchPoint)

    // Reset pinch state
    if (e.touches.length === 0) {
      setInitialDistance(null)
      setCurrentScale(1)
    }

    // Calculate swipe direction and distance
    const deltaX = touchPoint.x - touchStart.x
    const deltaY = touchPoint.y - touchStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = touchPoint.timestamp - touchStart.timestamp

    // Handle double tap
    if (onDoubleTap && distance < 10 && duration < 200) {
      if (lastTap && 
          touchPoint.timestamp - lastTap.timestamp < doubleTapDelay &&
          Math.abs(touchPoint.x - lastTap.x) < 20 &&
          Math.abs(touchPoint.y - lastTap.y) < 20) {
        onDoubleTap()
        setLastTap(null)
        return
      }
      setLastTap(touchPoint)
      return
    }

    // Handle swipe gestures
    if (distance > swipeThreshold) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }
  }, [disabled, touchStart, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, lastTap, swipeThreshold, doubleTapDelay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: disabled ? 'auto' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  )
}

// Hook for using touch gestures
export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false
}: Omit<TouchGestureProps, 'children' | 'className'>) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null)
  const [lastTap, setLastTap] = useState<TouchPoint | null>(null)
  const [initialDistance, setInitialDistance] = useState<number | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const handlers = {
    onTouchStart: useCallback((e: TouchEvent) => {
      if (disabled) return

      const touch = e.touches[0]
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }

      setTouchStart(touchPoint)

      if (e.touches.length === 2 && onPinch) {
        const distance = getDistance(e.touches[0], e.touches[1])
        setInitialDistance(distance)
      }

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
        }, longPressDelay)
      }
    }, [disabled, onPinch, onLongPress, longPressDelay, getDistance]),

    onTouchMove: useCallback((e: TouchEvent) => {
      if (disabled) return

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (e.touches.length === 2 && onPinch && initialDistance) {
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / initialDistance
        onPinch(scale)
      }
    }, [disabled, onPinch, initialDistance, getDistance]),

    onTouchEnd: useCallback((e: TouchEvent) => {
      if (disabled || !touchStart) return

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      const touch = e.changedTouches[0]
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }

      if (e.touches.length === 0) {
        setInitialDistance(null)
      }

      const deltaX = touchPoint.x - touchStart.x
      const deltaY = touchPoint.y - touchStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const duration = touchPoint.timestamp - touchStart.timestamp

      if (onDoubleTap && distance < 10 && duration < 200) {
        if (lastTap && 
            touchPoint.timestamp - lastTap.timestamp < doubleTapDelay &&
            Math.abs(touchPoint.x - lastTap.x) < 20 &&
            Math.abs(touchPoint.y - lastTap.y) < 20) {
          onDoubleTap()
          setLastTap(null)
          return
        }
        setLastTap(touchPoint)
        return
      }

      if (distance > swipeThreshold) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }
    }, [disabled, touchStart, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, lastTap, swipeThreshold, doubleTapDelay])
  }

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return handlers
}

// Swipe direction constants
export const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
} as const

export type SwipeDirection = typeof SWIPE_DIRECTIONS[keyof typeof SWIPE_DIRECTIONS]

export default TouchGestures