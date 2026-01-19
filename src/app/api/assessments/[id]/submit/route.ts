import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, updateAssessment } from '@/lib/mockData';
import { scoreAssessment, isAssessmentComplete, hasRequiredEvidence } from '@/lib/scoring';
import { AssessmentStatus } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/assessments/:id/submit - Submit assessment for review
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assessment = getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Only allow submission of drafts or in-review assessments
    if (![AssessmentStatus.Draft, AssessmentStatus.InReview].includes(assessment.status)) {
      return NextResponse.json(
        { success: false, error: 'Assessment cannot be submitted in current status' },
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

    // Validate evidence for yes answers
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
          error: 'Evidence required for Yes answers',
          missingEvidence: evidenceCheck.missingEvidence
        },
        { status: 400 }
      );
    }

    // Calculate final scores
    const scores = scoreAssessment({
      complianceAnswers: assessment.complianceAnswers,
      securityAnswers: assessment.securityAnswers,
      operationalAnswers: assessment.operationalAnswers,
      trustAnswers: assessment.trustAnswers
    });

    const updated = updateAssessment(id, {
      ...scores,
      status: AssessmentStatus.AwaitingApproval,
      assessedById: 'user-1', // TODO: Get from auth
      assessedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
