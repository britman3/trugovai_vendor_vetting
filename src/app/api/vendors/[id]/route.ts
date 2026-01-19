import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  updateVendor,
  deleteVendor,
  getAssessmentsByVendor
} from '@/lib/mockData';
import { isValidUrl } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vendors/:id - Get vendor detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vendor = getVendorById(id);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Include assessments for this vendor
    const assessments = getAssessmentsByVendor(id);

    return NextResponse.json({
      success: true,
      data: {
        ...vendor,
        assessments
      }
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/:id - Update vendor
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingVendor = getVendorById(id);
    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Validation
    if (body.name && (body.name.length < 2 || body.name.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'Vendor name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (body.website && !isValidUrl(body.website)) {
      return NextResponse.json(
        { success: false, error: 'Valid website URL is required' },
        { status: 400 }
      );
    }

    const vendor = updateVendor(id, {
      name: body.name || existingVendor.name,
      website: body.website || existingVendor.website,
      description: body.description || existingVendor.description,
      contactName: body.contactName !== undefined ? body.contactName : existingVendor.contactName,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : existingVendor.contactEmail
    });

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/:id - Delete vendor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const vendor = getVendorById(id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if vendor has any assessments
    const assessments = getAssessmentsByVendor(id);
    if (assessments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete vendor with existing assessments' },
        { status: 400 }
      );
    }

    deleteVendor(id);

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
