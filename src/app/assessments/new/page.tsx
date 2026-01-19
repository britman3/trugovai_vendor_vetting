'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, TextArea, Select, RadioGroup } from '@/components/ui';
import { Vendor, VendorProduct, AssessmentType } from '@/types';

function NewAssessmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVendorId = searchParams.get('vendorId');
  const preselectedProductId = searchParams.get('productId');

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    vendorId: preselectedVendorId || '',
    productId: preselectedProductId || '',
    assessmentType: AssessmentType.NewVendor,
    requestedBy: '',
    requestReason: '',
    department: '',
    completionMethod: 'internal' as 'internal' | 'vendor' | 'hybrid'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedVendor = vendors.find(v => v.id === formData.vendorId);
  const products = selectedVendor?.products || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create assessment');
        return;
      }

      // Redirect based on completion method
      if (formData.completionMethod === 'internal') {
        router.push(`/assessments/${data.data.id}/edit`);
      } else {
        router.push(`/assessments/${data.data.id}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = formData.vendorId !== '';
  const canProceedStep2 = formData.requestedBy && formData.requestReason;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Vendor Registry
        </Link>
        <h1 className="text-3xl font-bold text-navy">Start Assessment</h1>
        <p className="text-slate700 mt-1">Initiate a vendor vetting process</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-teal text-white'
                  : 'bg-slate700/20 text-slate700'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 ${
                  step > s ? 'bg-teal' : 'bg-slate700/20'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Select Vendor */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Vendor"
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                value={formData.vendorId}
                onChange={(value) => setFormData({ ...formData, vendorId: value, productId: '' })}
                placeholder="Select a vendor"
                required
              />

              {selectedVendor && products.length > 0 && (
                <Select
                  label="Product (Optional)"
                  options={[
                    { value: '', label: 'Assess vendor-level (all products)' },
                    ...products.map((p: VendorProduct) => ({ value: p.id, label: p.name }))
                  ]}
                  value={formData.productId}
                  onChange={(value) => setFormData({ ...formData, productId: value })}
                  placeholder="Select a product"
                />
              )}

              {vendors.length === 0 && (
                <div className="p-4 bg-ice rounded-[var(--radius)] text-center">
                  <p className="text-slate700 mb-4">No vendors found. Create a vendor first.</p>
                  <Link href="/vendors/new">
                    <Button variant="outline" size="sm">Add Vendor</Button>
                  </Link>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Assessment Context */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Assessment Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Assessment Type"
                options={[
                  { value: AssessmentType.NewVendor, label: 'New Vendor' },
                  { value: AssessmentType.Renewal, label: 'Renewal/Re-assessment' },
                  { value: AssessmentType.Expedited, label: 'Expedited Review' }
                ]}
                value={formData.assessmentType}
                onChange={(value) => setFormData({ ...formData, assessmentType: value as AssessmentType })}
                required
              />

              <Input
                label="Requested By"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                placeholder="Your name"
                required
              />

              <TextArea
                label="Request Reason"
                value={formData.requestReason}
                onChange={(e) => setFormData({ ...formData, requestReason: e.target.value })}
                placeholder="Why is this vendor being evaluated?"
                required
              />

              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Which team wants to use this? (optional)"
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Completion Method */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Choose Completion Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                name="completionMethod"
                value={formData.completionMethod}
                onChange={(value) => setFormData({ ...formData, completionMethod: value as 'internal' | 'vendor' | 'hybrid' })}
                options={[
                  { value: 'internal', label: 'Complete Internally' },
                  { value: 'vendor', label: 'Send to Vendor' },
                  { value: 'hybrid', label: 'Hybrid (Vendor provides evidence, you complete)' }
                ]}
              />

              <div className="p-4 bg-ice rounded-[var(--radius)]">
                {formData.completionMethod === 'internal' && (
                  <div>
                    <h4 className="font-medium text-navy mb-1">Complete Internally</h4>
                    <p className="text-sm text-slate700">
                      You will answer all 11 vetting questions based on your research and vendor documentation.
                    </p>
                  </div>
                )}
                {formData.completionMethod === 'vendor' && (
                  <div>
                    <h4 className="font-medium text-navy mb-1">Send to Vendor</h4>
                    <p className="text-sm text-slate700">
                      A unique link will be generated for the vendor to complete the questionnaire themselves.
                      You will be notified when they submit.
                    </p>
                  </div>
                )}
                {formData.completionMethod === 'hybrid' && (
                  <div>
                    <h4 className="font-medium text-navy mb-1">Hybrid Approach</h4>
                    <p className="text-sm text-slate700">
                      The vendor will receive a link to provide evidence and documentation.
                      You will review their submissions and complete the final assessment.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-rejected/10 border border-rejected/20 rounded-[var(--radius)] text-rejected">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button type="submit" loading={submitting}>
                  {formData.completionMethod === 'internal'
                    ? 'Start Assessment'
                    : 'Create & Generate Link'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    }>
      <NewAssessmentForm />
    </Suspense>
  );
}
