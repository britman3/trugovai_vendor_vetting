import { NextRequest, NextResponse } from 'next/server';
import {
  getAssessmentById,
  updateAssessment,
  getVendorById
} from '@/lib/mockData';
import { scoreAssessment } from '@/lib/scoring';
import { AssessmentStatus, VendorVerdict } from '@/types';
import { calculateExpiryDate } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/assessments/:id - Get assessment detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assessment = getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Enrich with vendor data
    const vendor = getVendorById(assessment.vendorId);
    const product = vendor?.products?.find(p => p.id === assessment.productId);

    return NextResponse.json({
      success: true,
      data: {
        ...assessment,
        vendor,
        product
      }
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

// PUT /api/assessments/:id - Update assessment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const assessment = getAssessmentById(id);
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Only allow updates to draft or in-review assessments
    if (![AssessmentStatus.Draft, AssessmentStatus.InReview, AssessmentStatus.AwaitingApproval].includes(assessment.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot update completed assessment' },
        { status: 400 }
      );
    }

    // Recalculate scores if answers are provided
    let scores = {
      complianceScore: assessment.complianceScore,
      securityScore: assessment.securityScore,
      operationalScore: assessment.operationalScore,
      trustScore: assessment.trustScore,
      totalScore: assessment.totalScore,
      verdict: assessment.verdict,
      conditions: assessment.conditions
    };

    if (body.complianceAnswers || body.securityAnswers || body.operationalAnswers || body.trustAnswers) {
      const newAnswers = {
        complianceAnswers: body.complianceAnswers || assessment.complianceAnswers,
        securityAnswers: body.securityAnswers || assessment.securityAnswers,
        operationalAnswers: body.operationalAnswers || assessment.operationalAnswers,
        trustAnswers: body.trustAnswers || assessment.trustAnswers
      };

      scores = scoreAssessment(newAnswers);
    }

    const updated = updateAssessment(id, {
      ...body,
      complianceScore: scores.complianceScore,
      securityScore: scores.securityScore,
      operationalScore: scores.operationalScore,
      trustScore: scores.trustScore,
      totalScore: scores.totalScore,
      verdict: scores.verdict,
      conditions: scores.conditions
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
