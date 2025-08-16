'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  loading?: 'lazy' | 'eager'
  unoptimized?: boolean
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  aspectRatio?: string
  responsive?: boolean
  webpSupport?: boolean
  avifSupport?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  unoptimized = false,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder-car.jpg',
  aspectRatio,
  responsive = true,
  webpSupport = true,
  avifSupport = true
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  // Generate optimized image sources
  const generateSources = (originalSrc: string) => {
    const sources = []
    
    // AVIF support (best compression)
    if (avifSupport && !originalSrc.includes('.svg')) {
      sources.push({
        srcSet: generateSrcSet(originalSrc, 'avif'),
        type: 'image/avif'
      })
    }
    
    // WebP support (good compression)
    if (webpSupport && !originalSrc.includes('.svg')) {
      sources.push({
        srcSet: generateSrcSet(originalSrc, 'webp'),
        type: 'image/webp'
      })
    }
    
    return sources
  }

  const generateSrcSet = (src: string, format: string) => {
    if (!responsive || !width) return src
    
    const breakpoints = [480, 768, 1024, 1280, 1920]
    return breakpoints
      .map(bp => {
        const scaledWidth = Math.min(bp, width)
        return `${src}?w=${scaledWidth}&f=${format}&q=${quality} ${scaledWidth}w`
      })
      .join(', ')
  }

  const handleImageLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(fallbackSrc)
      onError?.()
    }
  }

  // Generate blur placeholder
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    
    // Generate a simple blur placeholder
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width || 400}" height="${
        height || 300
      }" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Loading...</text></svg>`
    ).toString('base64')}`
  }

  // Container styles for aspect ratio
  const containerStyles = aspectRatio
    ? { aspectRatio }
    : width && height
    ? { aspectRatio: `${width}/${height}` }
    : {}

  const imageProps = {
    src: imageSrc,
    alt,
    quality,
    priority,
    loading: priority ? 'eager' as const : loading,
    unoptimized,
    onLoad: handleImageLoad,
    onError: handleImageError,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      className
    ),
    style: {
      objectFit,
      objectPosition
    }
  }

  if (fill) {
    return (
      <div 
        ref={imgRef}
        className={cn('relative overflow-hidden', className)}
        style={containerStyles}
      >
        {(isInView || priority) && (
          <>
            {/* Modern browsers with picture element for format selection */}
            <picture>
              {generateSources(imageSrc).map((source, index) => (
                <source
                  key={index}
                  srcSet={source.srcSet}
                  type={source.type}
                  sizes={sizes}
                />
              ))}
              <Image
                {...imageProps}
                fill
                sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                placeholder={placeholder}
                blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
              />
            </picture>
            
            {/* Loading placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative', className)}
      style={containerStyles}
    >
      {(isInView || priority) && (
        <>
          <picture>
            {generateSources(imageSrc).map((source, index) => (
              <source
                key={index}
                srcSet={source.srcSet}
                type={source.type}
                sizes={sizes}
              />
            ))}
            <Image
              {...imageProps}
              width={width}
              height={height}
              sizes={sizes}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
            />
          </picture>
          
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Utility component for car image galleries
export function CarImageGallery({ 
  images, 
  carName, 
  className 
}: { 
  images: string[]
  carName: string
  className?: string 
}) {
  const [currentImage, setCurrentImage] = useState(0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
        <OptimizedImage
          src={images[currentImage] || '/images/placeholder-car.jpg'}
          alt={`${carName} - Image ${currentImage + 1}`}
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImage + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors',
                currentImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <OptimizedImage
                src={image}
                alt={`${carName} - Thumbnail ${index + 1}`}
                fill
                quality={60}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}