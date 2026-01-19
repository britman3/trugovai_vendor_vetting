'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, VerdictBadge, StatusBadge } from '@/components/ui';
import { AssessmentForm } from '@/components/assessments';
import { VendorAssessment, Vendor, VendorProduct, CategoryAnswers, AssessmentStatus } from '@/types';

export default function AssessmentEditPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<VendorAssessment | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSave = async (data: {
    complianceAnswers: CategoryAnswers;
    securityAnswers: CategoryAnswers;
    operationalAnswers: CategoryAnswers;
    trustAnswers: CategoryAnswers;
    verdictNotes?: string;
  }) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      // Update local state
      setAssessment(result.data);
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: 'POST'
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to submit assessment');
        return;
      }

      router.push(`/assessments/${assessmentId}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  // Check if assessment can be edited
  const canEdit = [
    AssessmentStatus.Draft,
    AssessmentStatus.InReview
  ].includes(assessment.status);

  if (!canEdit) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate700 mb-4">This assessment cannot be edited in its current status.</p>
            <Link href={`/assessments/${assessmentId}`}>
              <Button>View Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/assessments/${assessmentId}`} className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Assessment
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">
              {vendor?.name} Assessment
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {product && (
                <span className="text-slate700">
                  Product: {product.name}
                </span>
              )}
              <StatusBadge status={assessment.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Info */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate700/70">Type</p>
              <p className="font-medium">{assessment.assessmentType}</p>
            </div>
            <div>
              <p className="text-slate700/70">Requested By</p>
              <p className="font-medium">{assessment.requestedBy}</p>
            </div>
            <div>
              <p className="text-slate700/70">Department</p>
              <p className="font-medium">{assessment.department || '-'}</p>
            </div>
            <div>
              <p className="text-slate700/70">Reason</p>
              <p className="font-medium truncate" title={assessment.requestReason}>
                {assessment.requestReason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Form */}
      <AssessmentForm
        initialComplianceAnswers={assessment.complianceAnswers}
        initialSecurityAnswers={assessment.securityAnswers}
        initialOperationalAnswers={assessment.operationalAnswers}
        initialTrustAnswers={assessment.trustAnswers}
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-rejected/10 border border-rejected/20 rounded-[var(--radius)] text-rejected">
          {error}
        </div>
      )}
    </div>
  );
}
