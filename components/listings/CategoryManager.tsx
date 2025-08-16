'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Save, X, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  listingCount: number;
  createdAt: string;
  children?: Category[];
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

interface CategoryManagerProps {
  className?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ className = '' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          parentId: formData.parentId || null
        })
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || ''
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  const toggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        setError('Failed to update category status');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category status');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getCategoryHierarchy = () => {
    const parentCategories = categories.filter(cat => !cat.parentId);
    return parentCategories.map(parent => ({
      ...parent,
      children: categories.filter(cat => cat.parentId === parent.id)
    }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Category Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Category Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentId">Parent Category</Label>
                    <select
                      id="parentId"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">None (Top Level)</option>
                      {getParentCategories().map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description (optional)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Display */}
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No categories found</p>
            <p className="text-sm">Create your first category to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategoryHierarchy().map(category => (
              <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {category.listingCount} listings
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(category.id, category.isActive)}
                    className="text-xs"
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>

                {/* Subcategories */}
                {category.children && category.children.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.children.map(child => (
                        <Badge key={child.id} variant="outline" className="text-xs">
                          {child.name} ({child.listingCount})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {getCategoryHierarchy().map(category => (
              <div key={category.id}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {category.listingCount} listings
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(category.id, category.isActive)}
                    >
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Subcategories in list view */}
                {category.children && category.children.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {category.children.map(child => (
                      <div key={child.id} className="flex items-center justify-between p-2 border-l-2 border-gray-200 pl-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">↳ {child.name}</span>
                          <Badge variant={child.isActive ? 'default' : 'secondary'} className="text-xs">
                            {child.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {child.listingCount} listings
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(child.id, child.isActive)}
                            className="text-xs"
                          >
                            {child.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(child)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(child.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;