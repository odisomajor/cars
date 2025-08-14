import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const rentalListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  pricePerDay: z.number().min(0, 'Price per day must be positive'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  category: z.string().min(1, 'Category is required'),
  seats: z.number().min(2).max(15),
  color: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  engineSize: z.string().optional(),
  features: z.array(z.string()).default([]),
  listingType: z.enum(['free', 'featured', 'premium', 'spotlight']).default('free'),
  minRentalDays: z.number().min(1).default(1),
  maxRentalDays: z.number().min(1).optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const data = {
      title: formData.get('title') as string,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      pricePerDay: parseInt(formData.get('pricePerDay') as string),
      fuelType: formData.get('fuelType') as string,
      transmission: formData.get('transmission') as string,
      category: formData.get('category') as string,
      seats: parseInt(formData.get('seats') as string),
      color: formData.get('color') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      engineSize: formData.get('engineSize') as string,
      features: JSON.parse(formData.get('features') as string || '[]'),
      listingType: formData.get('listingType') as 'free' | 'featured' | 'premium' | 'spotlight',
      minRentalDays: parseInt(formData.get('minRentalDays') as string) || 1,
      maxRentalDays: parseInt(formData.get('maxRentalDays') as string) || undefined,
      availableFrom: formData.get('availableFrom') as string,
      availableTo: formData.get('availableTo') as string
    };

    // Validate the data
    const validatedData = rentalListingSchema.parse(data);

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    if (images.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'rentals');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Process each image
      for (const image of images) {
        if (image.size > 0) {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const fileExtension = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = join(uploadsDir, fileName);
          
          // Save file
          await writeFile(filePath, buffer);
          
          // Store relative URL
          imageUrls.push(`/uploads/rentals/${fileName}`);
        }
      }
    }

    // Calculate listing expiration based on type
    const now = new Date();
    let expiresAt: Date;
    
    switch (validatedData.listingType) {
      case 'free':
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'featured':
        expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
        break;
      case 'premium':
        expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
        break;
      case 'spotlight':
        expiresAt = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 days
        break;
      default:
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Parse availability dates
    const availableFromDate = validatedData.availableFrom ? new Date(validatedData.availableFrom) : new Date();
    const availableToDate = validatedData.availableTo ? new Date(validatedData.availableTo) : null;

    // Create the rental listing in the database
    const rentalListing = await prisma.rentalListing.create({
      data: {
        title: validatedData.title,
        make: validatedData.make,
        model: validatedData.model,
        year: validatedData.year,
        pricePerDay: validatedData.pricePerDay,
        fuelType: validatedData.fuelType as any,
        transmission: validatedData.transmission as any,
        category: validatedData.category as any,
        seats: validatedData.seats,
        color: validatedData.color,
        location: validatedData.location,
        description: validatedData.description,
        engineSize: validatedData.engineSize,
        features: JSON.stringify(validatedData.features),
        images: JSON.stringify(imageUrls),
        listingType: validatedData.listingType as any,
        minRentalDays: validatedData.minRentalDays,
        maxRentalDays: validatedData.maxRentalDays,
        availableFrom: availableFromDate,
        availableTo: availableToDate,
        status: 'active',
        expiresAt,
        views: 0,
        contactCount: 0,
        userId: session.user.id,
        createdAt: now,
        updatedAt: now
      }
    });

    return NextResponse.json({
      id: rentalListing.id,
      message: 'Rental listing created successfully'
    });

  } catch (error) {
    console.error('Error creating rental listing:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const seats = searchParams.get('seats');
    const availableFrom = searchParams.get('availableFrom');
    const availableTo = searchParams.get('availableTo');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active',
      expiresAt: {
        gt: new Date()
      }
    };

    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (category) where.category = category;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (seats) where.seats = parseInt(seats);
    
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseInt(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseInt(maxPrice);
    }

    // Filter by availability dates
    if (availableFrom || availableTo) {
      if (availableFrom) {
        where.availableFrom = {
          lte: new Date(availableFrom)
        };
      }
      if (availableTo) {
        where.OR = [
          { availableTo: null },
          { availableTo: { gte: new Date(availableTo) } }
        ];
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'pricePerDay') {
      orderBy.pricePerDay = sortOrder;
    } else if (sortBy === 'year') {
      orderBy.year = sortOrder;
    } else if (sortBy === 'seats') {
      orderBy.seats = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get rental listings with user information
    const [rentalListings, total] = await Promise.all([
      prisma.rentalListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          bookings: {
            where: {
              status: {
                in: ['confirmed', 'active']
              }
            },
            select: {
              startDate: true,
              endDate: true
            }
          }
        }
      }),
      prisma.rentalListing.count({ where })
    ]);

    return NextResponse.json({
      rentalListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching rental listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}