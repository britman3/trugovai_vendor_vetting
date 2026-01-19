'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, VerdictBadge, StatusBadge, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui';
import { VendorAssessment, Vendor, VendorProduct, AssessmentStatus, VendorVerdict } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface EnrichedAssessment extends VendorAssessment {
  vendor?: Vendor;
  product?: VendorProduct | null;
}

export default function AssessmentsListPage() {
  const [assessments, setAssessments] = useState<EnrichedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      const data = await response.json();
      if (data.success) {
        setAssessments(data.data);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (statusFilter && assessment.status !== statusFilter) return false;
    if (verdictFilter && assessment.verdict !== verdictFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Assessments</h1>
          <p className="text-slate700 mt-1">All vendor assessment records</p>
        </div>
        <div className="flex gap-3">
          <Link href="/compare">
            <Button variant="outline">Compare Vendors</Button>
          </Link>
          <Link href="/assessments/new">
            <Button>Start Assessment</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select
              label="Filter by Status"
              options={[
                { value: AssessmentStatus.Draft, label: 'Draft' },
                { value: AssessmentStatus.AwaitingVendor, label: 'Awaiting Vendor' },
                { value: AssessmentStatus.InReview, label: 'In Review' },
                { value: AssessmentStatus.AwaitingApproval, label: 'Awaiting Approval' },
                { value: AssessmentStatus.Complete, label: 'Complete' },
                { value: AssessmentStatus.Expired, label: 'Expired' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Filter by Verdict"
              options={[
                { value: VendorVerdict.Approved, label: 'Approved' },
                { value: VendorVerdict.Conditional, label: 'Conditional' },
                { value: VendorVerdict.Rejected, label: 'Rejected' },
                { value: VendorVerdict.Pending, label: 'Pending' }
              ]}
              value={verdictFilter}
              onChange={setVerdictFilter}
              placeholder="All Verdicts"
            />
          </div>
          {(statusFilter || verdictFilter) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter('');
                  setVerdictFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Assessments Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.length === 0 ? (
              <TableEmpty
                message="No assessments found"
                action={
                  <Link href="/assessments/new">
                    <Button>Start Assessment</Button>
                  </Link>
                }
              />
            ) : (
              filteredAssessments.map(assessment => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <Link
                      href={`/vendors/${assessment.vendorId}`}
                      className="font-medium text-navy hover:text-teal"
                    >
                      {assessment.vendor?.name || 'Unknown Vendor'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {assessment.product?.name || (
                      <span className="text-slate700/50">Vendor-level</span>
                    )}
                  </TableCell>
                  <TableCell>{assessment.assessmentType}</TableCell>
                  <TableCell>
                    <span className="font-medium">{assessment.totalScore}/11</span>
                  </TableCell>
                  <TableCell>
                    <VerdictBadge verdict={assessment.verdict} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={assessment.status} />
                  </TableCell>
                  <TableCell>
                    <span title={formatDate(assessment.createdAt)}>
                      {formatRelativeTime(assessment.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {assessment.status === AssessmentStatus.Draft && (
                        <Link href={`/assessments/${assessment.id}/edit`}>
                          <Button variant="outline" size="sm">Continue</Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
