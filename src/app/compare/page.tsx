'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, VerdictBadge, Select } from '@/components/ui';
import { VendorAssessment, Vendor, VendorProduct } from '@/types';
import { COMPLIANCE_QUESTIONS, SECURITY_QUESTIONS, OPERATIONAL_QUESTIONS, TRUST_QUESTIONS, MAX_TOTAL_SCORE } from '@/lib/questions';
import { cn } from '@/lib/utils';

interface EnrichedAssessment extends VendorAssessment {
  vendor?: Vendor;
  product?: VendorProduct | null;
}

function ComparisonView() {
  const searchParams = useSearchParams();
  const initialIds = searchParams.get('ids')?.split(',') || [];

  const [allAssessments, setAllAssessments] = useState<EnrichedAssessment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      const data = await response.json();
      if (data.success) {
        // Filter to only completed assessments
        const completed = data.data.filter(
          (a: EnrichedAssessment) => a.status === 'Complete'
        );
        setAllAssessments(completed);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAssessments = allAssessments.filter(a => selectedIds.includes(a.id));

  const toggleAssessment = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getAnswerIcon = (answers: Record<string, { answer: string }>, questionId: string) => {
    const answer = answers[questionId]?.answer;
    switch (answer) {
      case 'yes':
        return <span className="text-approved">✅</span>;
      case 'no':
        return <span className="text-rejected">❌</span>;
      case 'na':
        return <span className="text-slate700">➖</span>;
      default:
        return <span className="text-conditional">❓</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Vendor Registry
        </Link>
        <h1 className="text-3xl font-bold text-navy">Compare Vendors</h1>
        <p className="text-slate700 mt-1">Side-by-side comparison of vendor assessments</p>
      </div>

      {/* Vendor Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Vendors to Compare (2-5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allAssessments.map(assessment => (
              <button
                key={assessment.id}
                onClick={() => toggleAssessment(assessment.id)}
                className={cn(
                  'px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors border',
                  selectedIds.includes(assessment.id)
                    ? 'bg-teal text-white border-teal'
                    : 'bg-white text-slate700 border-slate700/20 hover:border-teal'
                )}
              >
                {assessment.vendor?.name}
                {assessment.product && ` - ${assessment.product.name}`}
              </button>
            ))}
          </div>
          {allAssessments.length === 0 && (
            <p className="text-slate700/70 text-center py-4">
              No completed assessments available for comparison
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedAssessments.length >= 2 && (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold w-1/4">Criteria</th>
                {selectedAssessments.map(assessment => (
                  <th key={assessment.id} className="px-4 py-3 text-center text-sm font-semibold">
                    <div>
                      {assessment.vendor?.name}
                      {assessment.product && (
                        <span className="block text-xs font-normal opacity-75">
                          {assessment.product.name}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate700/10">
              {/* Compliance Questions */}
              <tr className="bg-compliance/5">
                <td colSpan={selectedAssessments.length + 1} className="px-4 py-2 font-semibold text-compliance">
                  ⚖️ Data & Compliance
                </td>
              </tr>
              {COMPLIANCE_QUESTIONS.map(q => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-sm text-slate700">{q.question}</td>
                  {selectedAssessments.map(assessment => (
                    <td key={assessment.id} className="px-4 py-3 text-center">
                      {getAnswerIcon(assessment.complianceAnswers, q.id)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Security Questions */}
              <tr className="bg-security/5">
                <td colSpan={selectedAssessments.length + 1} className="px-4 py-2 font-semibold text-security">
                  🔒 Security
                </td>
              </tr>
              {SECURITY_QUESTIONS.map(q => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-sm text-slate700">{q.question}</td>
                  {selectedAssessments.map(assessment => (
                    <td key={assessment.id} className="px-4 py-3 text-center">
                      {getAnswerIcon(assessment.securityAnswers, q.id)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Operational Questions */}
              <tr className="bg-operational/5">
                <td colSpan={selectedAssessments.length + 1} className="px-4 py-2 font-semibold text-operational">
                  ⚙️ Operational
                </td>
              </tr>
              {OPERATIONAL_QUESTIONS.map(q => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-sm text-slate700">{q.question}</td>
                  {selectedAssessments.map(assessment => (
                    <td key={assessment.id} className="px-4 py-3 text-center">
                      {getAnswerIcon(assessment.operationalAnswers, q.id)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Trust Questions */}
              <tr className="bg-trust/5">
                <td colSpan={selectedAssessments.length + 1} className="px-4 py-2 font-semibold text-trust">
                  🌍 Trust & Transparency
                </td>
              </tr>
              {TRUST_QUESTIONS.map(q => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-sm text-slate700">{q.question}</td>
                  {selectedAssessments.map(assessment => (
                    <td key={assessment.id} className="px-4 py-3 text-center">
                      {getAnswerIcon(assessment.trustAnswers, q.id)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Summary */}
              <tr className="bg-navy text-white font-semibold">
                <td className="px-4 py-3">Total Score</td>
                {selectedAssessments.map(assessment => (
                  <td key={assessment.id} className="px-4 py-3 text-center text-lg">
                    {assessment.totalScore}/{MAX_TOTAL_SCORE}
                  </td>
                ))}
              </tr>
              <tr className="bg-ice">
                <td className="px-4 py-3 font-semibold">Verdict</td>
                {selectedAssessments.map(assessment => (
                  <td key={assessment.id} className="px-4 py-3 text-center">
                    <VerdictBadge verdict={assessment.verdict} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {selectedAssessments.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate700/70">
              Select at least 2 vendors to compare
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    }>
      <ComparisonView />
    </Suspense>
  );
}
