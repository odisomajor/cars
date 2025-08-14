import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const updateRentalListingSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  make: z.string().min(1, 'Make is required').optional(),
  model: z.string().min(1, 'Model is required').optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  pricePerDay: z.number().min(0, 'Price per day must be positive').optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  category: z.string().optional(),
  seats: z.number().min(2).max(15).optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  engineSize: z.string().optional(),
  features: z.array(z.string()).optional(),
  listingType: z.enum(['free', 'featured', 'premium', 'spotlight']).optional(),
  minRentalDays: z.number().min(1).optional(),
  maxRentalDays: z.number().min(1).optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  status: z.enum(['active', 'inactive', 'rented', 'expired']).optional()
});

// GET - Get single rental listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rentalListing = await prisma.rentalListing.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: {
              select: {
                phone: true,
                location: true
              }
            }
          }
        },
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'active']
            }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!rentalListing) {
      return NextResponse.json(
        { error: 'Rental listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.rentalListing.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({ rentalListing });
  } catch (error) {
    console.error('Error fetching rental listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update rental listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if rental listing exists and user owns it
    const existingListing = await prisma.rentalListing.findUnique({
      where: { id: params.id }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Rental listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const data: any = {};
    
    const fields = ['title', 'make', 'model', 'fuelType', 'transmission', 'category', 'color', 'location', 'description', 'engineSize', 'listingType', 'status', 'availableFrom', 'availableTo'];
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) data[field] = value as string;
    });

    const numberFields = ['year', 'pricePerDay', 'seats', 'minRentalDays', 'maxRentalDays'];
    numberFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) data[field] = parseInt(value as string);
    });

    const features = formData.get('features');
    if (features) {
      data.features = JSON.parse(features as string);
    }

    // Validate the data
    const validatedData = updateRentalListingSchema.parse(data);

    // Handle image uploads
    const newImages = formData.getAll('images') as File[];
    const existingImages = JSON.parse(existingListing.images || '[]');
    let imageUrls = [...existingImages];

    if (newImages.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'rentals');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Process each new image
      for (const image of newImages) {
        if (image.size > 0) {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const fileExtension = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = join(uploadsDir, fileName);
          
          // Save file
          await writeFile(filePath, buffer);
          
          // Add to image URLs
          imageUrls.push(`/uploads/rentals/${fileName}`);
        }
      }
    }

    // Handle image deletions
    const imagesToDelete = formData.get('deleteImages');
    if (imagesToDelete) {
      const deleteList = JSON.parse(imagesToDelete as string);
      for (const imageUrl of deleteList) {
        // Remove from array
        imageUrls = imageUrls.filter(url => url !== imageUrl);
        
        // Delete file from filesystem
        try {
          const filePath = join(process.cwd(), 'public', imageUrl);
          await unlink(filePath);
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      }
    }

    // Parse availability dates if provided
    const updateData: any = { ...validatedData };
    if (validatedData.availableFrom) {
      updateData.availableFrom = new Date(validatedData.availableFrom);
    }
    if (validatedData.availableTo) {
      updateData.availableTo = new Date(validatedData.availableTo);
    }

    // Update the rental listing
    const updatedListing = await prisma.rentalListing.update({
      where: { id: params.id },
      data: {
        ...updateData,
        features: validatedData.features ? JSON.stringify(validatedData.features) : undefined,
        images: JSON.stringify(imageUrls),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Rental listing updated successfully',
      rentalListing: updatedListing
    });

  } catch (error) {
    console.error('Error updating rental listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete rental listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if rental listing exists and user owns it
    const existingListing = await prisma.rentalListing.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'active']
            }
          }
        }
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Rental listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if there are active bookings
    if (existingListing.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete rental listing with active bookings' },
        { status: 400 }
      );
    }

    // Delete associated images from filesystem
    const images = JSON.parse(existingListing.images || '[]');
    for (const imageUrl of images) {
      try {
        const filePath = join(process.cwd(), 'public', imageUrl);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    // Delete the rental listing (this will cascade delete related records)
    await prisma.rentalListing.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Rental listing deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting rental listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}