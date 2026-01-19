import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, addProductToVendor } from '@/lib/mockData';
import { ProductCategory, PricingModel } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/vendors/:id/products - Add product to vendor
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const vendor = getVendorById(id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { success: false, error: 'Product description is required' },
        { status: 400 }
      );
    }

    if (!body.category || !Object.values(ProductCategory).includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Valid product category is required' },
        { status: 400 }
      );
    }

    if (!body.pricingModel || !Object.values(PricingModel).includes(body.pricingModel)) {
      return NextResponse.json(
        { success: false, error: 'Valid pricing model is required' },
        { status: 400 }
      );
    }

    const product = addProductToVendor(id, {
      name: body.name,
      description: body.description,
      category: body.category,
      pricingModel: body.pricingModel
    });

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add product' },
      { status: 500 }
    );
  }
}
