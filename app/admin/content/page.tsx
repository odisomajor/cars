"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Settings,
  Save,
  X,
  Upload,
  Link,
  Calendar,
  Target
} from "lucide-react"
import Image from "next/image"

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
  position: 'HERO' | 'SIDEBAR' | 'FOOTER' | 'POPUP'
  startDate: string | null
  endDate: string | null
  clickCount: number
  impressionCount: number
  createdAt: string
}

interface ContentPage {
  id: string
  slug: string
  title: string
  content: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  seoSettings: {
    defaultTitle: string
    defaultDescription: string
    keywords: string
  }
}

export default function ContentManagement() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('banners')
  const [banners, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<ContentPage[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [modalType, setModalType] = useState<'banner' | 'page' | 'settings'>('banner')

  // Form states
  const [formData, setFormData] = useState<any>({})

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/")
      toast.error("Access denied. Admin privileges required.")
    }
  }, [user, authLoading, router])

  // Fetch content data
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchContentData()
    }
  }, [user])

  const fetchContentData = async () => {
    try {
      const [bannersResponse, pagesResponse, settingsResponse] = await Promise.all([
        fetch("/api/admin/content/banners"),
        fetch("/api/admin/content/pages"),
        fetch("/api/admin/content/settings")
      ])

      if (bannersResponse.ok) {
        const bannersData = await bannersResponse.json()
        setBanners(bannersData)
      }

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        setPages(pagesData)
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData)
      }
    } catch (error) {
      toast.error("Failed to load content data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      let endpoint = ""
      let method = "POST"
      
      if (modalType === 'banner') {
        endpoint = editingItem ? `/api/admin/content/banners/${editingItem.id}` : "/api/admin/content/banners"
        method = editingItem ? "PUT" : "POST"
      } else if (modalType === 'page') {
        endpoint = editingItem ? `/api/admin/content/pages/${editingItem.id}` : "/api/admin/content/pages"
        method = editingItem ? "PUT" : "POST"
      } else if (modalType === 'settings') {
        endpoint = "/api/admin/content/settings"
        method = "PUT"
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (modalType === 'banner') {
          if (editingItem) {
            setBanners(banners.map(b => b.id === editingItem.id ? data : b))
          } else {
            setBanners([...banners, data])
          }
        } else if (modalType === 'page') {
          if (editingItem) {
            setPages(pages.map(p => p.id === editingItem.id ? data : p))
          } else {
            setPages([...pages, data])
          }
        } else if (modalType === 'settings') {
          setSettings(data)
        }
        
        toast.success(`${modalType} ${editingItem ? 'updated' : 'created'} successfully`)
        handleCloseModal()
      } else {
        toast.error(`Failed to ${editingItem ? 'update' : 'create'} ${modalType}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleDelete = async (type: 'banner' | 'page', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return
    }

    try {
      const endpoint = type === 'banner' ? `/api/admin/content/banners/${id}` : `/api/admin/content/pages/${id}`
      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (response.ok) {
        if (type === 'banner') {
          setBanners(banners.filter(b => b.id !== id))
        } else {
          setPages(pages.filter(p => p.id !== id))
        }
        toast.success(`${type} deleted successfully`)
      } else {
        toast.error(`Failed to delete ${type}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleToggleStatus = async (type: 'banner' | 'page', id: string, field: string, value: boolean) => {
    try {
      const endpoint = type === 'banner' ? `/api/admin/content/banners/${id}` : `/api/admin/content/pages/${id}`
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        if (type === 'banner') {
          setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b))
        } else {
          setPages(pages.map(p => p.id === id ? { ...p, [field]: value } : p))
        }
        toast.success(`${type} ${value ? 'activated' : 'deactivated'} successfully`)
      } else {
        toast.error(`Failed to update ${type}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleOpenModal = (type: 'banner' | 'page' | 'settings', item?: any) => {
    setModalType(type)
    setEditingItem(item || null)
    
    if (type === 'banner') {
      setFormData(item || {
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        position: 'HERO',
        startDate: '',
        endDate: '',
        isActive: true
      })
    } else if (type === 'page') {
      setFormData(item || {
        slug: '',
        title: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        isPublished: true
      })
    } else if (type === 'settings') {
      setFormData(settings || {
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        socialLinks: {},
        seoSettings: {
          defaultTitle: '',
          defaultDescription: '',
          keywords: ''
        }
      })
    }
    
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage banners, pages, and site settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('banners')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'banners'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Banners
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Pages
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Banner Management</h2>
              <button
                onClick={() => handleOpenModal('banner')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleToggleStatus('banner', banner.id, 'isActive', !banner.isActive)}
                          className={`p-1 rounded-full ${
                            banner.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{banner.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{banner.position}</span>
                        <span>{banner.clickCount} clicks / {banner.impressionCount} views</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal('banner', banner)}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('banner', banner.id)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Page Management</h2>
              <button
                onClick={() => handleOpenModal('page')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus('page', page.id, 'isPublished', !page.isPublished)}
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal('page', page)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('page', page.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Site Settings</h2>
              <button
                onClick={() => handleOpenModal('settings', settings)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </button>
            </div>
            
            {settings && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Site Name</label>
                        <p className="text-sm text-gray-900">{settings.siteName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <p className="text-sm text-gray-900">{settings.siteDescription}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact Email</label>
                        <p className="text-sm text-gray-900">{settings.contactEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                        <p className="text-sm text-gray-900">{settings.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Default Title</label>
                        <p className="text-sm text-gray-900">{settings.seoSettings.defaultTitle}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Default Description</label>
                        <p className="text-sm text-gray-900">{settings.seoSettings.defaultDescription}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Keywords</label>
                        <p className="text-sm text-gray-900">{settings.seoSettings.keywords}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalType === 'banner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                    <input
                      type="url"
                      value={formData.linkUrl || ''}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={formData.position || 'HERO'}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="HERO">Hero</option>
                      <option value="SIDEBAR">Sidebar</option>
                      <option value="FOOTER">Footer</option>
                      <option value="POPUP">Popup</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {modalType === 'page' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle || ''}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {modalType === 'settings' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                      <input
                        type="text"
                        value={formData.siteName || ''}
                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={formData.contactEmail || ''}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <textarea
                      value={formData.siteDescription || ''}
                      onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={formData.contactPhone || ''}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">SEO Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
                        <input
                          type="text"
                          value={formData.seoSettings?.defaultTitle || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            seoSettings: { ...formData.seoSettings, defaultTitle: e.target.value }
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Description</label>
                        <textarea
                          value={formData.seoSettings?.defaultDescription || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            seoSettings: { ...formData.seoSettings, defaultDescription: e.target.value }
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                        <input
                          type="text"
                          value={formData.seoSettings?.keywords || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            seoSettings: { ...formData.seoSettings, keywords: e.target.value }
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>)}      </div>
      </div>
    </div>
  )
}