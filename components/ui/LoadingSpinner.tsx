'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
}

function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <p className={`text-secondary-600 ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Export both default and named
export default LoadingSpinner
export { LoadingSpinner }

// Skeleton loading components
export function CarCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-secondary-200" />
      <div className="p-6">
        <div className="h-6 bg-secondary-200 rounded mb-2" />
        <div className="h-4 bg-secondary-200 rounded w-2/3 mb-3" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="h-3 bg-secondary-200 rounded" />
          <div className="h-3 bg-secondary-200 rounded" />
          <div className="h-3 bg-secondary-200 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-secondary-200 rounded w-1/3" />
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="flex space-x-4">
            <div className="w-32 h-24 bg-secondary-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-secondary-200 rounded w-3/4" />
              <div className="h-4 bg-secondary-200 rounded w-1/2" />
              <div className="h-4 bg-secondary-200 rounded w-1/3" />
            </div>
            <div className="w-24 h-8 bg-secondary-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}