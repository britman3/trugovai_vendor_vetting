import { NextRequest, NextResponse } from 'next/server';
import {
  getVendors,
  createVendor,
  getVendorStats
} from '@/lib/mockData';
import { isValidUrl } from '@/lib/utils';

// GET /api/vendors - List all vendors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const vendors = getVendors();

    if (includeStats) {
      const stats = getVendorStats();
      return NextResponse.json({
        success: true,
        data: vendors,
        stats
      });
    }

    return NextResponse.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || body.name.length < 2 || body.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Vendor name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (!body.website || !isValidUrl(body.website)) {
      return NextResponse.json(
        { success: false, error: 'Valid website URL is required' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    // Check for duplicate vendor name
    const existingVendors = getVendors();
    if (existingVendors.some(v => v.name.toLowerCase() === body.name.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'A vendor with this name already exists' },
        { status: 400 }
      );
    }

    const vendor = createVendor({
      name: body.name,
      website: body.website,
      description: body.description,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      createdById: 'user-1', // TODO: Get from auth
      products: body.products || []
    });

    return NextResponse.json({
      success: true,
      data: vendor
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
