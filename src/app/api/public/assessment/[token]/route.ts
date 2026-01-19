import { NextRequest, NextResponse } from 'next/server';
import {
  getAssessmentByToken,
  updateAssessment,
  getVendorById
} from '@/lib/mockData';
import { scoreAssessment } from '@/lib/scoring';
import { AssessmentStatus } from '@/types';
import { isTokenExpired } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/public/assessment/:token - Get assessment for vendor
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const assessment = getAssessmentByToken(token);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (assessment.vendorTokenExpiresAt && isTokenExpired(assessment.vendorTokenExpiresAt)) {
      return NextResponse.json(
        { success: false, error: 'This assessment link has expired' },
        { status: 410 }
      );
    }

    // Check if vendor has already submitted
    if (assessment.vendorSubmittedAt) {
      return NextResponse.json(
        { success: false, error: 'This assessment has already been submitted' },
        { status: 400 }
      );
    }

    // Get vendor info
    const vendor = getVendorById(assessment.vendorId);
    const product = vendor?.products?.find(p => p.id === assessment.productId);

    // Return limited data for public access
    return NextResponse.json({
      success: true,
      data: {
        id: assessment.id,
        vendorName: vendor?.name,
        productName: product?.name,
        assessmentType: assessment.assessmentType,
        requestedBy: assessment.requestedBy,
        requestReason: assessment.requestReason,
        complianceAnswers: assessment.complianceAnswers,
        securityAnswers: assessment.securityAnswers,
        operationalAnswers: assessment.operationalAnswers,
        trustAnswers: assessment.trustAnswers
      }
    });
  } catch (error) {
    console.error('Error fetching public assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

// PUT /api/public/assessment/:token - Update answers
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json();

    const assessment = getAssessmentByToken(token);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (assessment.vendorTokenExpiresAt && isTokenExpired(assessment.vendorTokenExpiresAt)) {
      return NextResponse.json(
        { success: false, error: 'This assessment link has expired' },
        { status: 410 }
      );
    }

    // Check if vendor has already submitted
    if (assessment.vendorSubmittedAt) {
      return NextResponse.json(
        { success: false, error: 'This assessment has already been submitted' },
        { status: 400 }
      );
    }

    // Update answers (auto-save functionality)
    const updated = updateAssessment(assessment.id, {
      complianceAnswers: body.complianceAnswers || assessment.complianceAnswers,
      securityAnswers: body.securityAnswers || assessment.securityAnswers,
      operationalAnswers: body.operationalAnswers || assessment.operationalAnswers,
      trustAnswers: body.trustAnswers || assessment.trustAnswers
    });

    return NextResponse.json({
      success: true,
      data: {
        complianceAnswers: updated?.complianceAnswers,
        securityAnswers: updated?.securityAnswers,
        operationalAnswers: updated?.operationalAnswers,
        trustAnswers: updated?.trustAnswers
      }
    });
  } catch (error) {
    console.error('Error updating public assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
