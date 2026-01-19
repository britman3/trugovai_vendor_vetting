import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, getVendorById } from '@/lib/mockData';

// POST /api/assessments/compare - Compare multiple assessments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.assessmentIds || !Array.isArray(body.assessmentIds)) {
      return NextResponse.json(
        { success: false, error: 'Assessment IDs array is required' },
        { status: 400 }
      );
    }

    if (body.assessmentIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 assessments are required for comparison' },
        { status: 400 }
      );
    }

    if (body.assessmentIds.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5 assessments can be compared at once' },
        { status: 400 }
      );
    }

    const assessments = body.assessmentIds.map((id: string) => {
      const assessment = getAssessmentById(id);
      if (!assessment) return null;

      const vendor = getVendorById(assessment.vendorId);
      const product = vendor?.products?.find(p => p.id === assessment.productId);

      return {
        ...assessment,
        vendor,
        product
      };
    }).filter(Boolean);

    if (assessments.length !== body.assessmentIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more assessments not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        comparisonGenerated: new Date()
      }
    });
  } catch (error) {
    console.error('Error comparing assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compare assessments' },
      { status: 500 }
    );
  }
}
