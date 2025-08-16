'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, X, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { debounce } from 'lodash'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterFacets {
  makes: FilterOption[]
  bodyTypes: FilterOption[]
  fuelTypes: FilterOption[]
  transmissions: FilterOption[]
  conditions: FilterOption[]
  locations: FilterOption[]
  features: FilterOption[]
  priceRange: { min: number; max: number }
  yearRange: { min: number; max: number }
  mileageRange: { min: number; max: number }
}

interface FilterOptions {
  priceRange: [number, number]
  yearRange: [number, number]
  mileageRange: [number, number]
  makes: string[]
  models: string[]
  bodyTypes: string[]
  fuelTypes: string[]
  transmissions: string[]
  conditions: string[]
  locations: string[]
  features: string[]
  sortBy?: string
}

interface FilterSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  className?: string
  facets?: FilterFacets
}

const CheckboxList = ({ 
  options, 
  selectedValues, 
  onChange, 
  showCount = true,
  searchable = false,
  maxVisible = 8
}: {
  options: FilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  showCount?: boolean
  searchable?: boolean
  maxVisible?: number
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const visibleOptions = showAll ? filteredOptions : filteredOptions.slice(0, maxVisible)
  const hasMore = filteredOptions.length > maxVisible

  const handleChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionId])
    } else {
      onChange(selectedValues.filter(id => id !== optionId))
    }
  }

  return (
    <div className="space-y-3">
      {searchable && options.length > 5 && (
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-sm"
        />
      )}
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {visibleOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={selectedValues.includes(option.id)}
                onCheckedChange={(checked) => handleChange(option.id, checked as boolean)}
              />
              <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
            {showCount && option.count && (
              <span className="text-xs text-gray-500">({option.count})</span>
            )}
          </div>
        ))}
      </div>
      
      {hasMore && !searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
        >
          {showAll ? 'Show less' : `Show ${filteredOptions.length - maxVisible} more`}
        </Button>
      )}
    </div>
  )
}

export function FilterSidebar({ filters, onFiltersChange, onClearFilters, className, facets }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'make'])
  const [loading, setLoading] = useState(false)

  // Debounced filter change handler
  const debouncedOnFiltersChange = useCallback(
    debounce((newFilters: FilterOptions) => {
      onFiltersChange(newFilters)
    }, 300),
    [onFiltersChange]
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    debouncedOnFiltersChange(newFilters)
  }

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`
    }
    return `₦${(price / 1000).toFixed(0)}K`
  }

  // Default filter options (fallback if facets not provided)
  const defaultFilterSections = [
    {
      id: 'price',
      title: 'Price Range',
      type: 'range' as const,
      options: [],
      expanded: true
    },
    {
      id: 'year',
      title: 'Year',
      type: 'range' as const,
      options: []
    },
    {
      id: 'mileage',
      title: 'Mileage',
      type: 'range' as const,
      options: []
    },
    {
      id: 'makes',
      title: 'Make',
      type: 'checkbox' as const,
      options: facets?.makes || [
        { id: 'toyota', label: 'Toyota', count: 245 },
        { id: 'honda', label: 'Honda', count: 189 },
        { id: 'nissan', label: 'Nissan', count: 156 },
        { id: 'mazda', label: 'Mazda', count: 134 },
        { id: 'subaru', label: 'Subaru', count: 98 },
        { id: 'mitsubishi', label: 'Mitsubishi', count: 87 },
        { id: 'bmw', label: 'BMW', count: 76 },
        { id: 'mercedes', label: 'Mercedes-Benz', count: 65 }
      ],
      expanded: true,
      searchable: true
    },
    {
      id: 'bodyTypes',
      title: 'Body Type',
      type: 'checkbox' as const,
      options: facets?.bodyTypes || [
        { id: 'sedan', label: 'Sedan', count: 312 },
        { id: 'suv', label: 'SUV', count: 298 },
        { id: 'hatchback', label: 'Hatchback', count: 187 },
        { id: 'wagon', label: 'Station Wagon', count: 145 },
        { id: 'coupe', label: 'Coupe', count: 89 },
        { id: 'convertible', label: 'Convertible', count: 34 }
      ]
    },
    {
      id: 'fuelTypes',
      title: 'Fuel Type',
      type: 'checkbox' as const,
      options: facets?.fuelTypes || [
        { id: 'petrol', label: 'Petrol', count: 567 },
        { id: 'diesel', label: 'Diesel', count: 234 },
        { id: 'hybrid', label: 'Hybrid', count: 123 },
        { id: 'electric', label: 'Electric', count: 45 }
      ]
    },
    {
      id: 'transmissions',
      title: 'Transmission',
      type: 'checkbox' as const,
      options: facets?.transmissions || [
        { id: 'automatic', label: 'Automatic', count: 678 },
        { id: 'manual', label: 'Manual', count: 234 },
        { id: 'cvt', label: 'CVT', count: 156 }
      ]
    },
    {
      id: 'conditions',
      title: 'Condition',
      type: 'checkbox' as const,
      options: facets?.conditions || [
        { id: 'new', label: 'New', count: 123 },
        { id: 'used', label: 'Used', count: 789 },
        { id: 'certified', label: 'Certified Pre-owned', count: 156 }
      ]
    },
    {
      id: 'locations',
      title: 'Location',
      type: 'checkbox' as const,
      options: facets?.locations || [
        { id: 'nairobi', label: 'Nairobi', count: 456 },
        { id: 'mombasa', label: 'Mombasa', count: 234 },
        { id: 'kisumu', label: 'Kisumu', count: 123 },
        { id: 'nakuru', label: 'Nakuru', count: 98 },
        { id: 'eldoret', label: 'Eldoret', count: 76 }
      ],
      searchable: true
    },
    {
      id: 'features',
      title: 'Features',
      type: 'checkbox' as const,
      options: facets?.features || [
        { id: 'aircon', label: 'Air Conditioning', count: 567 },
        { id: 'leather', label: 'Leather Seats', count: 234 },
        { id: 'sunroof', label: 'Sunroof', count: 156 },
        { id: 'navigation', label: 'Navigation System', count: 123 },
        { id: 'bluetooth', label: 'Bluetooth', count: 456 },
        { id: 'backup_camera', label: 'Backup Camera', count: 234 }
      ],
      searchable: true
    }
  ]

  const getActiveFiltersCount = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        count += value.length
      }
    })
    return count
  }

  // Update filters when facets change
  useEffect(() => {
    if (facets) {
      const newFilters = {
        ...filters,
        priceRange: [facets.priceRange.min, facets.priceRange.max] as [number, number],
        yearRange: [facets.yearRange.min, facets.yearRange.max] as [number, number],
        mileageRange: [facets.mileageRange.min, facets.mileageRange.max] as [number, number]
      }
      onFiltersChange(newFilters)
    }
  }, [facets])



  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs hover:text-red-600"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select value={filters.sortBy || 'createdAt'} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="year_desc">Year: Newest First</SelectItem>
              <SelectItem value="year_asc">Year: Oldest First</SelectItem>
              <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
              <SelectItem value="mileage_desc">Mileage: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {defaultFilterSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <div key={section.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className="w-full justify-between p-0 h-auto font-medium text-left hover:bg-transparent"
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {isExpanded && (
                <div className="mt-4">
                  {section.type === 'range' && (
                    <div className="space-y-4">
                      {section.id === 'price' && (
                        <>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{formatPrice(filters.priceRange[0])}</span>
                            <span>{formatPrice(filters.priceRange[1])}</span>
                          </div>
                          <Slider
                            value={filters.priceRange}
                            onValueChange={(value) => updateFilter('priceRange', value)}
                            max={facets?.priceRange.max || 50000000}
                            min={facets?.priceRange.min || 0}
                            step={100000}
                            className="w-full"
                          />
                        </>
                      )}
                      
                      {section.id === 'year' && (
                        <>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{filters.yearRange[0]}</span>
                            <span>{filters.yearRange[1]}</span>
                          </div>
                          <Slider
                            value={filters.yearRange}
                            onValueChange={(value) => updateFilter('yearRange', value)}
                            max={facets?.yearRange.max || 2024}
                            min={facets?.yearRange.min || 2000}
                            step={1}
                            className="w-full"
                          />
                        </>
                      )}
                      
                      {section.id === 'mileage' && (
                        <>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{filters.mileageRange[0].toLocaleString()} km</span>
                            <span>{filters.mileageRange[1].toLocaleString()} km</span>
                          </div>
                          <Slider
                            value={filters.mileageRange}
                            onValueChange={(value) => updateFilter('mileageRange', value)}
                            max={facets?.mileageRange.max || 200000}
                            min={facets?.mileageRange.min || 0}
                            step={5000}
                            className="w-full"
                          />
                        </>
                      )}
                    </div>
                  )}
                  
                  {section.type === 'checkbox' && (
                    <CheckboxList
                      options={section.options}
                      selectedValues={filters[section.id as keyof FilterOptions] as string[]}
                      onChange={(values) => updateFilter(section.id as keyof FilterOptions, values)}
                      searchable={section.searchable}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}