'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, VerdictBadge, StatusBadge, ScoreDisplay, Badge, TextArea, Modal } from '@/components/ui';
import { VendorAssessment, Vendor, VendorProduct, AssessmentStatus, VendorVerdict, CategoryAnswers } from '@/types';
import { formatDate, getVendorAssessmentUrl } from '@/lib/utils';
import { CATEGORY_METADATA, COMPLIANCE_QUESTIONS, SECURITY_QUESTIONS, OPERATIONAL_QUESTIONS, TRUST_QUESTIONS, MAX_TOTAL_SCORE } from '@/lib/questions';
import { cn } from '@/lib/utils';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<VendorAssessment | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load assessment');
        return;
      }

      setAssessment(data.data);
      setVendor(data.data.vendor);
      setProduct(data.data.product);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdictNotes: approvalNotes })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to approve assessment');
        return;
      }

      setAssessment(data.data);
      setShowApproveModal(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!approvalNotes || approvalNotes.length < 20) {
      setError('Rejection reason must be at least 20 characters');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdictNotes: approvalNotes })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to reject assessment');
        return;
      }

      setAssessment(data.data);
      setShowRejectModal(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAnswerSummary = (answers: CategoryAnswers, questions: typeof COMPLIANCE_QUESTIONS) => {
    return questions.map(q => {
      const answer = answers[q.id];
      const answerValue = answer?.answer;

      return (
        <div key={q.id} className="flex items-start gap-3 py-2 border-b border-slate700/10 last:border-0">
          <span className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs',
            answerValue === 'yes' ? 'bg-approved' :
              answerValue === 'no' ? 'bg-rejected' :
                answerValue === 'na' ? 'bg-slate700' :
                  'bg-conditional'
          )}>
            {answerValue === 'yes' ? '✓' :
              answerValue === 'no' ? '✗' :
                answerValue === 'na' ? '-' : '?'}
          </span>
          <div className="flex-1">
            <p className="text-sm text-slate700">{q.question}</p>
            {answer?.evidence && (
              <a
                href={answer.evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal hover:underline"
              >
                📎 Evidence
              </a>
            )}
            {answer?.notes && (
              <p className="text-xs text-slate700/70 mt-1">{answer.notes}</p>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate700/20 rounded w-32 mb-4"></div>
          <div className="h-10 bg-slate700/20 rounded w-1/3 mb-8"></div>
          <div className="h-96 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-rejected mb-4">{error || 'Assessment not found'}</p>
            <Link href="/">
              <Button>Back to Registry</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAwaitingApproval = assessment.status === AssessmentStatus.AwaitingApproval;
  const isDraft = assessment.status === AssessmentStatus.Draft;
  const isComplete = assessment.status === AssessmentStatus.Complete;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Vendor Registry
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">
              Vendor Assessment Review
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-slate700">
                {vendor?.name} {product && `- ${product.name}`}
              </span>
              <StatusBadge status={assessment.status} />
            </div>
          </div>
          <div className="flex gap-3">
            {isDraft && (
              <Link href={`/assessments/${assessmentId}/edit`}>
                <Button>Continue Assessment</Button>
              </Link>
            )}
            {isAwaitingApproval && (
              <>
                <Button variant="outline" onClick={() => setShowRejectModal(true)}>
                  Reject
                </Button>
                <Button onClick={() => setShowApproveModal(true)}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Score Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="col-span-2 md:col-span-1 text-center p-4 bg-ice rounded-[var(--radius)]">
                  <p className="text-3xl font-bold text-navy">{assessment.totalScore}/{MAX_TOTAL_SCORE}</p>
                  <p className="text-xs text-slate700">Total</p>
                </div>
                <div className="text-center p-4 bg-compliance/10 rounded-[var(--radius)]">
                  <p className="text-2xl font-bold text-compliance">{assessment.complianceScore}/3</p>
                  <p className="text-xs text-slate700">Compliance</p>
                </div>
                <div className="text-center p-4 bg-security/10 rounded-[var(--radius)]">
                  <p className="text-2xl font-bold text-security">{assessment.securityScore}/3</p>
                  <p className="text-xs text-slate700">Security</p>
                </div>
                <div className="text-center p-4 bg-operational/10 rounded-[var(--radius)]">
                  <p className="text-2xl font-bold text-operational">{assessment.operationalScore}/3</p>
                  <p className="text-xs text-slate700">Operational</p>
                </div>
                <div className="text-center p-4 bg-trust/10 rounded-[var(--radius)]">
                  <p className="text-2xl font-bold text-trust">{assessment.trustScore}/2</p>
                  <p className="text-xs text-slate700">Trust</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-ice rounded-[var(--radius)]">
                <div>
                  <p className="text-sm text-slate700/70">Verdict</p>
                  <div className="flex items-center gap-3 mt-1">
                    <VerdictBadge verdict={assessment.verdict} />
                    <span className="text-sm text-slate700">
                      {assessment.totalScore >= 9 ? 'Low Risk' :
                        assessment.totalScore >= 5 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                </div>
                {isComplete && assessment.reviewedAt && (
                  <div className="text-right">
                    <p className="text-sm text-slate700/70">Approved</p>
                    <p className="text-sm font-medium">{formatDate(assessment.reviewedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          {assessment.conditions && assessment.conditions.length > 0 && (
            <Card className="border-l-4 border-l-conditional">
              <CardHeader>
                <CardTitle>Conditions for Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assessment.conditions.map((condition, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate700">
                      <span className="text-conditional">•</span>
                      {condition}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Answer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Compliance */}
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-3">
                  <span>{CATEGORY_METADATA.compliance.icon}</span>
                  Data & Compliance
                </h3>
                {renderAnswerSummary(assessment.complianceAnswers, COMPLIANCE_QUESTIONS)}
              </div>

              {/* Security */}
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-3">
                  <span>{CATEGORY_METADATA.security.icon}</span>
                  Security
                </h3>
                {renderAnswerSummary(assessment.securityAnswers, SECURITY_QUESTIONS)}
              </div>

              {/* Operational */}
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-3">
                  <span>{CATEGORY_METADATA.operational.icon}</span>
                  Operational
                </h3>
                {renderAnswerSummary(assessment.operationalAnswers, OPERATIONAL_QUESTIONS)}
              </div>

              {/* Trust */}
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2 mb-3">
                  <span>{CATEGORY_METADATA.trust.icon}</span>
                  Trust & Transparency
                </h3>
                {renderAnswerSummary(assessment.trustAnswers, TRUST_QUESTIONS)}
              </div>
            </CardContent>
          </Card>

          {/* Verdict Notes */}
          {assessment.verdictNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate700">{assessment.verdictNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assessment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate700/70">Type</span>
                <span>{assessment.assessmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate700/70">Requested By</span>
                <span>{assessment.requestedBy}</span>
              </div>
              {assessment.department && (
                <div className="flex justify-between">
                  <span className="text-slate700/70">Department</span>
                  <span>{assessment.department}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate700/70">Created</span>
                <span>{formatDate(assessment.createdAt)}</span>
              </div>
              {assessment.assessedAt && (
                <div className="flex justify-between">
                  <span className="text-slate700/70">Assessed</span>
                  <span>{formatDate(assessment.assessedAt)}</span>
                </div>
              )}
              {assessment.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-slate700/70">Expires</span>
                  <span>{formatDate(assessment.expiresAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Token Link */}
          {assessment.vendorToken && !assessment.vendorSubmittedAt && (
            <Card>
              <CardHeader>
                <CardTitle>Vendor Self-Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate700 mb-3">
                  Share this link with the vendor to complete the questionnaire:
                </p>
                <div className="p-3 bg-ice rounded-[var(--radius)] break-all text-xs font-mono">
                  {getVendorAssessmentUrl(assessment.vendorToken)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(getVendorAssessmentUrl(assessment.vendorToken!));
                  }}
                >
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Request Reason */}
          <Card>
            <CardHeader>
              <CardTitle>Request Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate700">{assessment.requestReason}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {isComplete && (
                <Link href={`/assessments/${assessmentId}/export`}>
                  <Button variant="primary" className="w-full">
                    Export as PDF
                  </Button>
                </Link>
              )}
              <Link href={`/vendors/${assessment.vendorId}`}>
                <Button variant="outline" className="w-full">
                  View Vendor
                </Button>
              </Link>
              <Link href={`/compare?ids=${assessmentId}`}>
                <Button variant="ghost" className="w-full">
                  Compare with Others
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Assessment"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-ice rounded-[var(--radius)]">
            <div>
              <p className="font-medium text-navy">{vendor?.name}</p>
              <p className="text-sm text-slate700">{product?.name || 'Vendor-level assessment'}</p>
            </div>
            <VerdictBadge verdict={assessment.verdict} />
          </div>

          <TextArea
            label="Approval Notes (Optional)"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add any notes for this approval..."
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} loading={isProcessing}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Assessment"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rejected/10 rounded-[var(--radius)]">
            <p className="text-sm text-rejected">
              Rejecting this assessment will mark the vendor as not approved for use.
            </p>
          </div>

          <TextArea
            label="Rejection Reason (Required)"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Explain why this vendor is being rejected (min 20 characters)..."
            required
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={isProcessing}
              disabled={approvalNotes.length < 20}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
