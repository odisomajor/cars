'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mail, Edit, Copy, Trash2, Plus, Eye, Send, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'notification' | 'marketing' | 'transactional'
  isActive: boolean
  lastModified: string
  usageCount: number
}

interface EmailTemplatesProps {
  className?: string
}

const EmailTemplates: React.FC<EmailTemplatesProps> = ({ className }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to CarDealership Pro!',
      content: 'Welcome to our platform! We\'re excited to have you on board.',
      type: 'welcome',
      isActive: true,
      lastModified: '2024-01-15',
      usageCount: 245
    },
    {
      id: '2',
      name: 'Sale Notification',
      subject: 'New Sale Alert - {{car_model}}',
      content: 'Congratulations! You have a new sale for {{car_model}}.',
      type: 'notification',
      isActive: true,
      lastModified: '2024-01-14',
      usageCount: 89
    },
    {
      id: '3',
      name: 'Monthly Newsletter',
      subject: 'Your Monthly Sales Report',
      content: 'Here\'s your monthly performance summary and market insights.',
      type: 'marketing',
      isActive: false,
      lastModified: '2024-01-10',
      usageCount: 156
    }
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || template.type === filterType
    return matchesSearch && matchesType
  })

  const handleSaveTemplate = (template: EmailTemplate) => {
    setTemplates(prev => 
      prev.map(t => t.id === template.id ? { ...template, lastModified: new Date().toISOString().split('T')[0] } : t)
    )
    setIsEditing(false)
    setSelectedTemplate(null)
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastModified: new Date().toISOString().split('T')[0]
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800'
      case 'notification': return 'bg-green-100 text-green-800'
      case 'marketing': return 'bg-purple-100 text-purple-800'
      case 'transactional': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">Manage your email templates and notifications</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new email template for your notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" placeholder="Enter template name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" placeholder="Enter email subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Enter email content..." 
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="transactional">Transactional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                    {!template.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={template.isActive}
                    onCheckedChange={(checked) => {
                      setTemplates(prev => 
                        prev.map(t => t.id === template.id ? { ...t, isActive: checked } : t)
                      )
                    }}
                  />
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsEditing(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Last modified: {template.lastModified}</span>
                <span>Used {template.usageCount} times</span>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm line-clamp-2">{template.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No templates match your current filters.' 
                : 'Create your first email template to get started.'}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EmailTemplates