import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, updateAssessment } from '@/lib/mockData';
import { AssessmentStatus, VendorVerdict } from '@/types';
import { calculateExpiryDate } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/assessments/:id/approve - Approve assessment
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Only allow approval of assessments awaiting approval
    if (assessment.status !== AssessmentStatus.AwaitingApproval) {
      return NextResponse.json(
        { success: false, error: 'Assessment is not awaiting approval' },
        { status: 400 }
      );
    }

    // Validate override reason if verdict is being overridden
    if (body.overrideVerdict && body.overrideVerdict !== assessment.verdict) {
      if (!body.verdictNotes || body.verdictNotes.length < 20) {
        return NextResponse.json(
          { success: false, error: 'Override justification must be at least 20 characters' },
          { status: 400 }
        );
      }
    }

    // Validate conditions for conditional approval
    const finalVerdict = body.overrideVerdict || assessment.verdict;
    if (finalVerdict === VendorVerdict.Conditional) {
      const conditions = body.conditions || assessment.conditions;
      if (!conditions || conditions.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Conditional approval requires at least one condition' },
          { status: 400 }
        );
      }
    }

    const updated = updateAssessment(id, {
      status: AssessmentStatus.Complete,
      verdict: finalVerdict,
      verdictNotes: body.verdictNotes || assessment.verdictNotes,
      conditions: body.conditions || assessment.conditions,
      reviewedById: 'user-2', // TODO: Get from auth
      reviewedAt: new Date(),
      expiresAt: finalVerdict !== VendorVerdict.Rejected
        ? calculateExpiryDate(new Date(), 12)
        : null
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error approving assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve assessment' },
      { status: 500 }
    );
  }
}
