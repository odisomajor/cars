'use client'

import { useState, useEffect } from 'react'
import { FileText, Save, Plus, Trash2, Edit, Eye, AlertCircle, Check, X } from 'lucide-react'

interface RentalPolicy {
  id: string
  type: 'FUEL' | 'CANCELLATION' | 'INSURANCE' | 'DAMAGE' | 'LATE_RETURN' | 'CLEANING' | 'MILEAGE' | 'DRIVER' | 'PAYMENT' | 'GENERAL'
  title: string
  description: string
  isRequired: boolean
  isActive: boolean
  order: number
  conditions?: {
    minimumAge?: number
    maximumAge?: number
    drivingLicenseYears?: number
    depositAmount?: number
    cancellationHours?: number
    refundPercentage?: number
    mileageLimit?: number
    extraMileageRate?: number
    lateFeePerHour?: number
    cleaningFee?: number
  }
}

interface RentalTermsSetupProps {
  vehicleId?: string
  companyId?: string
  onSave?: (terms: RentalPolicy[]) => void
}

const POLICY_TYPES = [
  { value: 'FUEL', label: 'Fuel Policy', icon: '⛽' },
  { value: 'CANCELLATION', label: 'Cancellation Policy', icon: '❌' },
  { value: 'INSURANCE', label: 'Insurance Policy', icon: '🛡️' },
  { value: 'DAMAGE', label: 'Damage Policy', icon: '🔧' },
  { value: 'LATE_RETURN', label: 'Late Return Policy', icon: '⏰' },
  { value: 'CLEANING', label: 'Cleaning Policy', icon: '🧽' },
  { value: 'MILEAGE', label: 'Mileage Policy', icon: '📏' },
  { value: 'DRIVER', label: 'Driver Requirements', icon: '👤' },
  { value: 'PAYMENT', label: 'Payment Terms', icon: '💳' },
  { value: 'GENERAL', label: 'General Terms', icon: '📋' }
]

const DEFAULT_POLICIES: Partial<RentalPolicy>[] = [
  {
    type: 'FUEL',
    title: 'Fuel Policy',
    description: 'Vehicle must be returned with the same fuel level as when rented. A refueling charge will apply if returned with less fuel.',
    isRequired: true,
    isActive: true
  },
  {
    type: 'CANCELLATION',
    title: 'Cancellation Policy',
    description: 'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours are subject to a 50% charge.',
    isRequired: true,
    isActive: true,
    conditions: {
      cancellationHours: 24,
      refundPercentage: 50
    }
  },
  {
    type: 'DRIVER',
    title: 'Driver Requirements',
    description: 'Driver must be between 21-70 years old with a valid driving license held for at least 2 years.',
    isRequired: true,
    isActive: true,
    conditions: {
      minimumAge: 21,
      maximumAge: 70,
      drivingLicenseYears: 2
    }
  },
  {
    type: 'INSURANCE',
    title: 'Insurance Coverage',
    description: 'Basic insurance is included. Additional comprehensive coverage available for extra charge.',
    isRequired: true,
    isActive: true
  },
  {
    type: 'DAMAGE',
    title: 'Damage Policy',
    description: 'Renter is responsible for any damage to the vehicle. Security deposit will be held and released upon safe return.',
    isRequired: true,
    isActive: true,
    conditions: {
      depositAmount: 50000
    }
  }
]

export default function RentalTermsSetup({ vehicleId, companyId, onSave }: RentalTermsSetupProps) {
  const [policies, setPolicies] = useState<RentalPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<RentalPolicy | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [newPolicy, setNewPolicy] = useState<Partial<RentalPolicy>>({
    type: 'GENERAL',
    title: '',
    description: '',
    isRequired: false,
    isActive: true,
    conditions: {}
  })

  useEffect(() => {
    loadPolicies()
  }, [vehicleId, companyId])

  const loadPolicies = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual implementation
      const existingPolicies = localStorage.getItem(`rental-policies-${vehicleId || companyId}`)
      if (existingPolicies) {
        setPolicies(JSON.parse(existingPolicies))
      } else {
        // Initialize with default policies
        const defaultPolicies: RentalPolicy[] = DEFAULT_POLICIES.map((policy, index) => ({
          id: `policy-${index + 1}`,
          order: index + 1,
          ...policy
        } as RentalPolicy))
        setPolicies(defaultPolicies)
      }
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePolicies = async () => {
    setIsSaving(true)
    try {
      // Mock API call - replace with actual implementation
      localStorage.setItem(`rental-policies-${vehicleId || companyId}`, JSON.stringify(policies))
      onSave?.(policies)
      
      // Show success message
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      console.error('Error saving policies:', error)
      setIsSaving(false)
    }
  }

  const addPolicy = () => {
    if (!newPolicy.title || !newPolicy.description) return

    const policy: RentalPolicy = {
      id: `policy-${Date.now()}`,
      type: newPolicy.type as RentalPolicy['type'],
      title: newPolicy.title,
      description: newPolicy.description,
      isRequired: newPolicy.isRequired || false,
      isActive: newPolicy.isActive || true,
      order: policies.length + 1,
      conditions: newPolicy.conditions || {}
    }

    setPolicies([...policies, policy])
    setNewPolicy({
      type: 'GENERAL',
      title: '',
      description: '',
      isRequired: false,
      isActive: true,
      conditions: {}
    })
    setShowAddForm(false)
  }

  const updatePolicy = (updatedPolicy: RentalPolicy) => {
    setPolicies(policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p))
    setEditingPolicy(null)
  }

  const deletePolicy = (policyId: string) => {
    setPolicies(policies.filter(p => p.id !== policyId))
  }

  const togglePolicyStatus = (policyId: string) => {
    setPolicies(policies.map(p => 
      p.id === policyId ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const reorderPolicies = (dragIndex: number, hoverIndex: number) => {
    const draggedPolicy = policies[dragIndex]
    const newPolicies = [...policies]
    newPolicies.splice(dragIndex, 1)
    newPolicies.splice(hoverIndex, 0, draggedPolicy)
    
    // Update order numbers
    const reorderedPolicies = newPolicies.map((policy, index) => ({
      ...policy,
      order: index + 1
    }))
    
    setPolicies(reorderedPolicies)
  }

  const getPolicyIcon = (type: string) => {
    const policyType = POLICY_TYPES.find(pt => pt.value === type)
    return policyType?.icon || '📋'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Rental Terms & Conditions</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
            </button>
            <button
              onClick={savePolicies}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isSaving ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {!previewMode && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Policy</span>
          </button>
        )}
      </div>

      {/* Add New Policy Form */}
      {showAddForm && !previewMode && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Policy</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
                <select
                  value={newPolicy.type}
                  onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value as RentalPolicy['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {POLICY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  placeholder="Policy title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                placeholder="Policy description and terms"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newPolicy.isRequired}
                  onChange={(e) => setNewPolicy({ ...newPolicy, isRequired: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Required for all rentals</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addPolicy}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Policy
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policies List */}
      <div className="p-6">
        {previewMode ? (
          /* Preview Mode */
          <div className="space-y-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
              {policies
                .filter(policy => policy.isActive)
                .sort((a, b) => a.order - b.order)
                .map((policy, index) => (
                  <div key={policy.id} className="mb-6">
                    <h4 className="text-base font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <span>{getPolicyIcon(policy.type)}</span>
                      <span>{index + 1}. {policy.title}</span>
                      {policy.isRequired && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Required</span>
                      )}
                    </h4>
                    <p className="text-gray-700 mb-3">{policy.description}</p>
                    
                    {policy.conditions && Object.keys(policy.conditions).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Specific Terms:</p>
                        <ul className="space-y-1 text-gray-700">
                          {policy.conditions.minimumAge && (
                            <li>• Minimum age: {policy.conditions.minimumAge} years</li>
                          )}
                          {policy.conditions.maximumAge && (
                            <li>• Maximum age: {policy.conditions.maximumAge} years</li>
                          )}
                          {policy.conditions.drivingLicenseYears && (
                            <li>• Driving license required for: {policy.conditions.drivingLicenseYears} years</li>
                          )}
                          {policy.conditions.depositAmount && (
                            <li>• Security deposit: {formatCurrency(policy.conditions.depositAmount)}</li>
                          )}
                          {policy.conditions.cancellationHours && (
                            <li>• Free cancellation: {policy.conditions.cancellationHours} hours before pickup</li>
                          )}
                          {policy.conditions.refundPercentage && (
                            <li>• Late cancellation refund: {policy.conditions.refundPercentage}%</li>
                          )}
                          {policy.conditions.mileageLimit && (
                            <li>• Daily mileage limit: {policy.conditions.mileageLimit} km</li>
                          )}
                          {policy.conditions.extraMileageRate && (
                            <li>• Extra mileage rate: {formatCurrency(policy.conditions.extraMileageRate)}/km</li>
                          )}
                          {policy.conditions.lateFeePerHour && (
                            <li>• Late return fee: {formatCurrency(policy.conditions.lateFeePerHour)}/hour</li>
                          )}
                          {policy.conditions.cleaningFee && (
                            <li>• Cleaning fee: {formatCurrency(policy.conditions.cleaningFee)}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            {policies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No policies configured</h3>
                <p className="text-gray-600 mb-6">Add your first rental policy to get started.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Policy</span>
                </button>
              </div>
            ) : (
              policies
                .sort((a, b) => a.order - b.order)
                .map((policy) => (
                  <div key={policy.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getPolicyIcon(policy.type)}</span>
                          <h3 className="text-lg font-medium text-gray-900">{policy.title}</h3>
                          <div className="flex items-center space-x-2">
                            {policy.isRequired && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Required</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              policy.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {policy.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{policy.description}</p>
                        
                        {policy.conditions && Object.keys(policy.conditions).length > 0 && (
                          <div className="bg-white rounded p-3 text-sm">
                            <p className="font-medium text-gray-900 mb-1">Conditions:</p>
                            <div className="text-gray-600">
                              {Object.entries(policy.conditions).map(([key, value]) => (
                                <span key={key} className="inline-block mr-4">
                                  {key}: {typeof value === 'number' && key.includes('Amount') ? formatCurrency(value) : value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => togglePolicyStatus(policy.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            policy.isActive 
                              ? 'text-green-600 hover:bg-green-100' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={policy.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {policy.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingPolicy(policy)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePolicy(policy.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Policy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingPolicy.description}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingPolicy.isRequired}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, isRequired: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required for all rentals</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updatePolicy(editingPolicy)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}