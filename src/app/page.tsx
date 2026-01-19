'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, StatsCard, Card, VerdictBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, Select } from '@/components/ui';
import { Vendor, VendorAssessment, VendorVerdict, VendorRegistryStats, ProductCategory } from '@/types';
import { formatDate, formatRelativeTime, isExpiringSoon } from '@/lib/utils';

export default function VendorRegistryPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [assessments, setAssessments] = useState<(VendorAssessment & { vendor?: Vendor })[]>([]);
  const [stats, setStats] = useState<VendorRegistryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsRes, assessmentsRes] = await Promise.all([
        fetch('/api/vendors?includeStats=true'),
        fetch('/api/assessments')
      ]);

      const vendorsData = await vendorsRes.json();
      const assessmentsData = await assessmentsRes.json();

      if (vendorsData.success) {
        setVendors(vendorsData.data);
        setStats(vendorsData.stats);
      }

      if (assessmentsData.success) {
        setAssessments(assessmentsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get latest assessment for each vendor
  const getLatestAssessment = (vendorId: string) => {
    const vendorAssessments = assessments.filter(a => a.vendorId === vendorId);
    if (vendorAssessments.length === 0) return null;
    return vendorAssessments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const latestAssessment = getLatestAssessment(vendor.id);

    // Verdict filter
    if (verdictFilter) {
      if (!latestAssessment || latestAssessment.verdict !== verdictFilter) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter) {
      const hasCategory = vendor.products?.some(p => p.category === categoryFilter);
      if (!hasCategory) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate700/20 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate700/20 rounded-[var(--radius)]"></div>
            ))}
          </div>
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
          <h1 className="text-3xl font-bold text-navy">Vendor Registry</h1>
          <p className="text-slate700 mt-1">Central directory of all AI vendors and their assessment status</p>
        </div>
        <div className="flex gap-3">
          <Link href="/vendors/new">
            <Button variant="outline">Add New Vendor</Button>
          </Link>
          <Link href="/assessments/new">
            <Button>Start Assessment</Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Vendors"
            value={stats.totalVendors}
            variant="default"
            icon={<span>🏢</span>}
          />
          <StatsCard
            title="Approved Vendors"
            value={stats.approvedVendors}
            variant="approved"
            icon={<span>✅</span>}
          />
          <StatsCard
            title="Conditional Vendors"
            value={stats.conditionalVendors}
            variant="conditional"
            icon={<span>⚠️</span>}
          />
          <StatsCard
            title="Pending Assessments"
            value={stats.pendingAssessments}
            variant="pending"
            icon={<span>⏳</span>}
          />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="w-full sm:w-48">
            <Select
              label="Filter by Category"
              options={Object.values(ProductCategory).map(cat => ({
                value: cat,
                label: cat
              }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="All Categories"
            />
          </div>
          {(verdictFilter || categoryFilter) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setVerdictFilter('');
                  setCategoryFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Vendors Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Latest Verdict</TableHead>
              <TableHead>Last Assessed</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableEmpty
                message="No vendors found"
                action={
                  <Link href="/vendors/new">
                    <Button>Add Your First Vendor</Button>
                  </Link>
                }
              />
            ) : (
              filteredVendors.map(vendor => {
                const latestAssessment = getLatestAssessment(vendor.id);
                const expiringSoon = latestAssessment?.expiresAt
                  ? isExpiringSoon(latestAssessment.expiresAt)
                  : false;

                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="font-medium text-navy hover:text-teal"
                        >
                          {vendor.name}
                        </Link>
                        <p className="text-xs text-slate700/70 mt-0.5 truncate max-w-[200px]">
                          {vendor.website}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.products?.slice(0, 2).map(product => (
                          <span
                            key={product.id}
                            className="inline-block px-2 py-0.5 bg-ice text-xs rounded"
                          >
                            {product.name}
                          </span>
                        ))}
                        {(vendor.products?.length || 0) > 2 && (
                          <span className="text-xs text-slate700/70">
                            +{(vendor.products?.length || 0) - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {latestAssessment ? (
                        <VerdictBadge verdict={latestAssessment.verdict} />
                      ) : (
                        <span className="text-slate700/50 text-sm">Not assessed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestAssessment?.assessedAt ? (
                        <span title={formatDate(latestAssessment.assessedAt)}>
                          {formatRelativeTime(latestAssessment.assessedAt)}
                        </span>
                      ) : (
                        <span className="text-slate700/50">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestAssessment?.expiresAt ? (
                        <span className={expiringSoon ? 'text-conditional font-medium' : ''}>
                          {formatDate(latestAssessment.expiresAt)}
                          {expiringSoon && ' ⚠️'}
                        </span>
                      ) : (
                        <span className="text-slate700/50">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/vendors/${vendor.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/assessments/new?vendorId=${vendor.id}`}>
                          <Button variant="outline" size="sm">
                            {latestAssessment ? 'Reassess' : 'Assess'}
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
