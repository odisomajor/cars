'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

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
}

interface FilterSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
}

export function FilterSidebar({ filters, onFiltersChange, onClearFilters }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    make: true,
    year: false,
    mileage: false,
    bodyType: false,
    fuelType: false,
    transmission: false,
    condition: false,
    location: false,
    features: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Mock data for filter options
  const filterData = {
    makes: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen'],
    models: ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Civic', 'Accord', 'CR-V', 'Pilot', 'Altima'],
    bodyTypes: ['Sedan', 'SUV', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Crossover'],
    fuelTypes: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'],
    transmissions: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'],
    conditions: ['New', 'Used', 'Certified Pre-owned'],
    locations: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Meru', 'Nyeri', 'Kericho'],
    features: [
      'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking', 'ABS',
      'Airbags', 'Alloy Wheels', 'Fog Lights', 'Sunroof', 'Leather Seats',
      'Navigation System', 'Bluetooth', 'USB Port', 'Backup Camera', 'Cruise Control'
    ]
  }

  const FilterSection = ({ title, isExpanded, onToggle, children }: {
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
  }) => (
    <div className="border-b border-secondary-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary-50 transition-colors"
      >
        <span className="font-medium text-secondary-900">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-secondary-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary-600" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )

  const RangeSlider = ({ 
    min, 
    max, 
    value, 
    onChange, 
    formatValue,
    step = 1 
  }: {
    min: number
    max: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    formatValue?: (value: number) => string
    step?: number
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-secondary-600">
        <span>{formatValue ? formatValue(value[0]) : value[0].toLocaleString()}</span>
        <span>{formatValue ? formatValue(value[1]) : value[1].toLocaleString()}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
          className="absolute w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
          className="absolute w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
      </div>
    </div>
  )

  const CheckboxList = ({ 
    options, 
    selected, 
    onChange,
    showSearch = false 
  }: {
    options: string[]
    selected: string[]
    onChange: (value: string) => void
    showSearch?: boolean
  }) => {
    const [searchTerm, setSearchTerm] = useState('')
    
    const filteredOptions = showSearch 
      ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
      : options

    return (
      <div className="space-y-2">
        {showSearch && (
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        )}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredOptions.map((option) => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-secondary-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="h-full overflow-y-auto pb-20">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <RangeSlider
            min={0}
            max={10000000}
            step={100000}
            value={filters.priceRange}
            onChange={(value) => updateFilter('priceRange', value)}
            formatValue={formatPrice}
          />
        </FilterSection>

        {/* Make */}
        <FilterSection
          title="Make"
          isExpanded={expandedSections.make}
          onToggle={() => toggleSection('make')}
        >
          <CheckboxList
            options={filterData.makes}
            selected={filters.makes}
            onChange={(value) => toggleArrayFilter('makes', value)}
            showSearch
          />
        </FilterSection>

        {/* Year Range */}
        <FilterSection
          title="Year"
          isExpanded={expandedSections.year}
          onToggle={() => toggleSection('year')}
        >
          <RangeSlider
            min={1990}
            max={new Date().getFullYear()}
            value={filters.yearRange}
            onChange={(value) => updateFilter('yearRange', value)}
          />
        </FilterSection>

        {/* Mileage Range */}
        <FilterSection
          title="Mileage (km)"
          isExpanded={expandedSections.mileage}
          onToggle={() => toggleSection('mileage')}
        >
          <RangeSlider
            min={0}
            max={500000}
            step={10000}
            value={filters.mileageRange}
            onChange={(value) => updateFilter('mileageRange', value)}
            formatValue={(value) => value.toLocaleString()}
          />
        </FilterSection>

        {/* Body Type */}
        <FilterSection
          title="Body Type"
          isExpanded={expandedSections.bodyType}
          onToggle={() => toggleSection('bodyType')}
        >
          <CheckboxList
            options={filterData.bodyTypes}
            selected={filters.bodyTypes}
            onChange={(value) => toggleArrayFilter('bodyTypes', value)}
          />
        </FilterSection>

        {/* Fuel Type */}
        <FilterSection
          title="Fuel Type"
          isExpanded={expandedSections.fuelType}
          onToggle={() => toggleSection('fuelType')}
        >
          <CheckboxList
            options={filterData.fuelTypes}
            selected={filters.fuelTypes}
            onChange={(value) => toggleArrayFilter('fuelTypes', value)}
          />
        </FilterSection>

        {/* Transmission */}
        <FilterSection
          title="Transmission"
          isExpanded={expandedSections.transmission}
          onToggle={() => toggleSection('transmission')}
        >
          <CheckboxList
            options={filterData.transmissions}
            selected={filters.transmissions}
            onChange={(value) => toggleArrayFilter('transmissions', value)}
          />
        </FilterSection>

        {/* Condition */}
        <FilterSection
          title="Condition"
          isExpanded={expandedSections.condition}
          onToggle={() => toggleSection('condition')}
        >
          <CheckboxList
            options={filterData.conditions}
            selected={filters.conditions}
            onChange={(value) => toggleArrayFilter('conditions', value)}
          />
        </FilterSection>

        {/* Location */}
        <FilterSection
          title="Location"
          isExpanded={expandedSections.location}
          onToggle={() => toggleSection('location')}
        >
          <CheckboxList
            options={filterData.locations}
            selected={filters.locations}
            onChange={(value) => toggleArrayFilter('locations', value)}
            showSearch
          />
        </FilterSection>

        {/* Features */}
        <FilterSection
          title="Features"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <CheckboxList
            options={filterData.features}
            selected={filters.features}
            onChange={(value) => toggleArrayFilter('features', value)}
            showSearch
          />
        </FilterSection>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}