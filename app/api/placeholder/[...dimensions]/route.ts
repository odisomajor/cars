import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const [width, height] = params.dimensions
    const w = parseInt(width) || 400
    const h = parseInt(height) || 300

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="20" y="20" width="${w-40}" height="${h-40}" fill="#e5e7eb" rx="8"/>
        <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">
          Car Image
        </text>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
          ${w} × ${h}
        </text>
        <circle cx="${w*0.3}" cy="${h*0.7}" r="${Math.min(w,h)*0.05}" fill="#d1d5db"/>
        <circle cx="${w*0.7}" cy="${h*0.7}" r="${Math.min(w,h)*0.05}" fill="#d1d5db"/>
        <rect x="${w*0.25}" y="${h*0.3}" width="${w*0.5}" height="${h*0.25}" fill="#d1d5db" rx="4"/>
        <rect x="${w*0.3}" y="${h*0.35}" width="${w*0.4}" height="${h*0.15}" fill="#e5e7eb" rx="2"/>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating placeholder:', error)
    return NextResponse.json(
      { error: 'Failed to generate placeholder' },
      { status: 500 }
    )
  }
}