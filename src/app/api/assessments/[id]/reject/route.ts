import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, updateAssessment } from '@/lib/mockData';
import { AssessmentStatus, VendorVerdict } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/assessments/:id/reject - Reject assessment
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

    // Only allow rejection of assessments awaiting approval
    if (assessment.status !== AssessmentStatus.AwaitingApproval) {
      return NextResponse.json(
        { success: false, error: 'Assessment is not awaiting approval' },
        { status: 400 }
      );
    }

    // Require rejection reason
    if (!body.verdictNotes || body.verdictNotes.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason must be at least 20 characters' },
        { status: 400 }
      );
    }

    const updated = updateAssessment(id, {
      status: AssessmentStatus.Complete,
      verdict: VendorVerdict.Rejected,
      verdictNotes: body.verdictNotes,
      conditions: [],
      reviewedById: 'user-2', // TODO: Get from auth
      reviewedAt: new Date(),
      expiresAt: null
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error rejecting assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject assessment' },
      { status: 500 }
    );
  }
}
