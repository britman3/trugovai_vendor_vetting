import { NextRequest, NextResponse } from 'next/server';
import {
  getAssessmentByToken,
  updateAssessment
} from '@/lib/mockData';
import { scoreAssessment, isAssessmentComplete, hasRequiredEvidence } from '@/lib/scoring';
import { AssessmentStatus } from '@/types';
import { isTokenExpired } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// POST /api/public/assessment/:token/submit - Vendor submits assessment
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Validate all questions are answered
    const isComplete = isAssessmentComplete(
      assessment.complianceAnswers,
      assessment.securityAnswers,
      assessment.operationalAnswers,
      assessment.trustAnswers
    );

    if (!isComplete) {
      return NextResponse.json(
        { success: false, error: 'All questions must be answered before submission' },
        { status: 400 }
      );
    }

    // Validate evidence for yes answers (required for vendor submissions)
    const evidenceCheck = hasRequiredEvidence(
      assessment.complianceAnswers,
      assessment.securityAnswers,
      assessment.operationalAnswers,
      assessment.trustAnswers
    );

    if (!evidenceCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evidence is required for all Yes answers',
          missingEvidence: evidenceCheck.missingEvidence
        },
        { status: 400 }
      );
    }

    // Calculate scores
    const scores = scoreAssessment({
      complianceAnswers: assessment.complianceAnswers,
      securityAnswers: assessment.securityAnswers,
      operationalAnswers: assessment.operationalAnswers,
      trustAnswers: assessment.trustAnswers
    });

    const updated = updateAssessment(assessment.id, {
      ...scores,
      status: AssessmentStatus.InReview,
      vendorSubmittedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for completing the assessment. The internal team will review your submission.',
      data: {
        submittedAt: updated?.vendorSubmittedAt,
        status: updated?.status
      }
    });
  } catch (error) {
    console.error('Error submitting public assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
