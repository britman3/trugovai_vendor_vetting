'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { AssessmentForm } from '@/components/assessments';
import { CategoryAnswers } from '@/types';

interface PublicAssessmentData {
  id: string;
  vendorName?: string;
  productName?: string;
  assessmentType: string;
  requestedBy: string;
  requestReason: string;
  complianceAnswers: CategoryAnswers;
  securityAnswers: CategoryAnswers;
  operationalAnswers: CategoryAnswers;
  trustAnswers: CategoryAnswers;
}

export default function VendorSelfServicePage() {
  const params = useParams();
  const token = params.token as string;

  const [assessment, setAssessment] = useState<PublicAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [token]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/public/assessment/${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load assessment');
        return;
      }

      setAssessment(data.data);
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
  }) => {
    try {
      const response = await fetch(`/api/public/assessment/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      // Update local state
      setAssessment(prev => prev ? { ...prev, ...result.data } : null);
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/public/assessment/${token}/submit`, {
        method: 'POST'
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to submit assessment');
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ice">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate700/20 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-slate700/20 rounded-[var(--radius)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ice flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-rejected/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-navy mb-2">Unable to Load Assessment</h2>
            <p className="text-slate700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-ice flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-approved/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-navy mb-2">Thank You!</h2>
            <p className="text-slate700 mb-4">
              Your assessment responses have been submitted successfully.
              The requesting organization will review your submission and may contact you if they need additional information.
            </p>
            <p className="text-sm text-slate700/70">
              You can close this page now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ice">
      {/* Custom Header for Public Page */}
      <div className="bg-navy text-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <span className="font-bold">TruGovAI</span>
              <span className="text-xs text-mint300 ml-1">Vendor Assessment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Landing Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vendor Assessment Questionnaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate700/70">Vendor</p>
                <p className="font-medium text-navy">{assessment.vendorName}</p>
              </div>
              {assessment.productName && (
                <div>
                  <p className="text-sm text-slate700/70">Product</p>
                  <p className="font-medium text-navy">{assessment.productName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate700/70">Requested By</p>
                <p className="font-medium text-navy">{assessment.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-slate700/70">Assessment Type</p>
                <p className="font-medium text-navy">{assessment.assessmentType}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate700/10">
              <p className="text-sm text-slate700/70 mb-1">Purpose of Assessment</p>
              <p className="text-slate700">{assessment.requestReason}</p>
            </div>

            <div className="p-4 bg-teal/10 rounded-[var(--radius)]">
              <h4 className="font-medium text-navy mb-2">Instructions</h4>
              <ul className="text-sm text-slate700 space-y-1">
                <li>• Please answer all 11 questions honestly and completely</li>
                <li>• Provide evidence (URLs or documentation) for all &quot;Yes&quot; answers</li>
                <li>• Your progress is automatically saved as you work</li>
                <li>• Click &quot;Submit Responses&quot; when you have completed all questions</li>
              </ul>
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
          vendorSelfService={true}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-rejected/10 border border-rejected/20 rounded-[var(--radius)] text-rejected">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate700/10 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate700/70">
            TruGovAI™ Vendor Vetting — Part of the TruGovAI™ Toolkit
          </p>
        </div>
      </div>
    </div>
  );
}
