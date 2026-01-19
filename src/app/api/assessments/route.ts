import { NextRequest, NextResponse } from 'next/server';
import {
  getAssessments,
  createAssessment,
  getVendorById
} from '@/lib/mockData';
import { generateVendorToken, getTokenExpiryDate } from '@/lib/utils';
import { AssessmentType, VendorVerdict, AssessmentStatus } from '@/types';

// GET /api/assessments - List all assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const verdict = searchParams.get('verdict');

    let assessments = getAssessments();

    // Filter by vendorId
    if (vendorId) {
      assessments = assessments.filter(a => a.vendorId === vendorId);
    }

    // Filter by status
    if (status) {
      assessments = assessments.filter(a => a.status === status);
    }

    // Filter by verdict
    if (verdict) {
      assessments = assessments.filter(a => a.verdict === verdict);
    }

    // Enrich with vendor data
    const enrichedAssessments = assessments.map(assessment => {
      const vendor = getVendorById(assessment.vendorId);
      const product = vendor?.products?.find(p => p.id === assessment.productId);
      return {
        ...assessment,
        vendor,
        product
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedAssessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Create assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const vendor = getVendorById(body.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (!body.assessmentType || !Object.values(AssessmentType).includes(body.assessmentType)) {
      return NextResponse.json(
        { success: false, error: 'Valid assessment type is required' },
        { status: 400 }
      );
    }

    if (!body.requestedBy) {
      return NextResponse.json(
        { success: false, error: 'Requester name is required' },
        { status: 400 }
      );
    }

    if (!body.requestReason) {
      return NextResponse.json(
        { success: false, error: 'Request reason is required' },
        { status: 400 }
      );
    }

    // Generate vendor token if completion method is 'vendor' or 'hybrid'
    let vendorToken = null;
    let vendorTokenExpiresAt = null;
    let initialStatus = AssessmentStatus.Draft;

    if (body.completionMethod === 'vendor' || body.completionMethod === 'hybrid') {
      vendorToken = generateVendorToken();
      vendorTokenExpiresAt = getTokenExpiryDate(7); // 7 days default
      initialStatus = AssessmentStatus.AwaitingVendor;
    }

    const assessment = createAssessment({
      vendorId: body.vendorId,
      productId: body.productId || null,
      assessmentType: body.assessmentType,
      requestedBy: body.requestedBy,
      requestReason: body.requestReason,
      department: body.department || null,
      complianceScore: 0,
      securityScore: 0,
      operationalScore: 0,
      trustScore: 0,
      totalScore: 0,
      complianceAnswers: {},
      securityAnswers: {},
      operationalAnswers: {},
      trustAnswers: {},
      verdict: VendorVerdict.Pending,
      verdictNotes: null,
      conditions: [],
      status: initialStatus,
      assessedById: null,
      assessedAt: null,
      reviewedById: null,
      reviewedAt: null,
      vendorToken,
      vendorTokenExpiresAt,
      vendorSubmittedAt: null,
      createdById: 'user-1', // TODO: Get from auth
      expiresAt: null,
      version: 1
    });

    return NextResponse.json({
      success: true,
      data: assessment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
