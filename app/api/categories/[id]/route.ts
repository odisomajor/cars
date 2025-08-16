import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const categoryId = params.id;
    const body = await request.json();
    const { name, description, parentId, isActive } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update name and slug if name is provided
    if (name && name.trim() !== existingCategory.name) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists (excluding current category)
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: categoryId }
        }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = slug;
    }

    // Update description
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Update parent category
    if (parentId !== undefined) {
      if (parentId) {
        // Validate parent category
        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId }
        });

        if (!parentCategory) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          );
        }

        // Prevent circular references
        if (parentId === categoryId) {
          return NextResponse.json(
            { error: 'Category cannot be its own parent' },
            { status: 400 }
          );
        }

        // Prevent creating subcategories of subcategories
        if (parentCategory.parentId) {
          return NextResponse.json(
            { error: 'Cannot create subcategories more than 2 levels deep' },
            { status: 400 }
          );
        }

        // Check if this category has children - if so, it cannot become a subcategory
        const hasChildren = await prisma.category.findFirst({
          where: { parentId: categoryId }
        });

        if (hasChildren) {
          return NextResponse.json(
            { error: 'Categories with subcategories cannot become subcategories themselves' },
            { status: 400 }
          );
        }
      }
      updateData.parentId = parentId || null;
    }

    // Update active status
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            listings: true,
            rentalListings: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        parentId: updatedCategory.parentId,
        isActive: updatedCategory.isActive,
        listingCount: updatedCategory._count.listings + updatedCategory._count.rentalListings,
        createdAt: updatedCategory.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const categoryId = params.id;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            listings: true,
            rentalListings: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has listings
    const totalListings = category._count.listings + category._count.rentalListings;
    if (totalListings > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${totalListings} active listings. Please move or delete the listings first.` },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.children} subcategories. Please delete or move the subcategories first.` },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/categories/[id] - Get a specific category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                listings: true,
                rentalListings: true
              }
            }
          }
        },
        _count: {
          select: {
            listings: true,
            rentalListings: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        listingCount: category._count.listings + category._count.rentalListings,
        createdAt: category.createdAt.toISOString(),
        parent: category.parent ? {
          id: category.parent.id,
          name: category.parent.name,
          slug: category.parent.slug
        } : null,
        children: category.children.map(child => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          isActive: child.isActive,
          listingCount: child._count.listings + child._count.rentalListings,
          createdAt: child.createdAt.toISOString()
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}