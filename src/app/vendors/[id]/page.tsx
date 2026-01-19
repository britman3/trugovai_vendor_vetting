'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, VerdictBadge, StatusBadge, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui';
import { Vendor, VendorAssessment, VendorProduct } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load vendor');
        return;
      }

      setVendor(data.data);
      setAssessments(data.data.assessments || []);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate700/20 rounded w-32 mb-4"></div>
          <div className="h-10 bg-slate700/20 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-slate700/20 rounded-[var(--radius)]"></div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-rejected mb-4">{error || 'Vendor not found'}</p>
            <Link href="/">
              <Button>Back to Registry</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestAssessment = assessments.length > 0
    ? assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Vendor Registry
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-navy">{vendor.name}</h1>
              {latestAssessment && (
                <VerdictBadge verdict={latestAssessment.verdict} />
              )}
            </div>
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              {vendor.website}
            </a>
          </div>
          <div className="flex gap-3">
            <Link href={`/assessments/new?vendorId=${vendor.id}`}>
              <Button>
                {latestAssessment ? 'New Assessment' : 'Start Assessment'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate700">{vendor.description}</p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <span className="text-sm text-slate700">
                {vendor.products?.length || 0} products
              </span>
            </CardHeader>
            <CardContent>
              {vendor.products && vendor.products.length > 0 ? (
                <div className="space-y-3">
                  {vendor.products.map((product: VendorProduct) => (
                    <div
                      key={product.id}
                      className="p-4 bg-ice rounded-[var(--radius)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-navy">{product.name}</h4>
                          <p className="text-sm text-slate700 mt-1">{product.description}</p>
                        </div>
                        <Link href={`/assessments/new?vendorId=${vendor.id}&productId=${product.id}`}>
                          <Button variant="outline" size="sm">Assess</Button>
                        </Link>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge>{product.category}</Badge>
                        <Badge variant="default">{product.pricingModel}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate700/70 text-center py-4">
                  No products added yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Assessment History */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate700/10">
              <CardTitle>Assessment History</CardTitle>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length === 0 ? (
                  <TableEmpty
                    message="No assessments yet"
                    action={
                      <Link href={`/assessments/new?vendorId=${vendor.id}`}>
                        <Button size="sm">Start Assessment</Button>
                      </Link>
                    }
                  />
                ) : (
                  assessments
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(assessment => {
                      const product = vendor.products?.find(p => p.id === assessment.productId);
                      return (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <span title={formatDate(assessment.createdAt)}>
                              {formatRelativeTime(assessment.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {product?.name || 'Vendor-level'}
                          </TableCell>
                          <TableCell>{assessment.assessmentType}</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {assessment.totalScore}/11
                            </span>
                          </TableCell>
                          <TableCell>
                            <VerdictBadge verdict={assessment.verdict} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={assessment.status} />
                          </TableCell>
                          <TableCell>
                            <Link href={`/assessments/${assessment.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.contactName || vendor.contactEmail ? (
                <div className="space-y-2">
                  {vendor.contactName && (
                    <div>
                      <p className="text-xs text-slate700/70 uppercase">Name</p>
                      <p className="text-navy">{vendor.contactName}</p>
                    </div>
                  )}
                  {vendor.contactEmail && (
                    <div>
                      <p className="text-xs text-slate700/70 uppercase">Email</p>
                      <a
                        href={`mailto:${vendor.contactEmail}`}
                        className="text-teal hover:underline"
                      >
                        {vendor.contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate700/70">No contact information</p>
              )}
            </CardContent>
          </Card>

          {/* Latest Assessment Summary */}
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <VerdictBadge verdict={latestAssessment.verdict} />
                  <span className="text-2xl font-bold text-navy">
                    {latestAssessment.totalScore}/11
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate700">Compliance</span>
                    <span className="font-medium">{latestAssessment.complianceScore}/3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate700">Security</span>
                    <span className="font-medium">{latestAssessment.securityScore}/3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate700">Operational</span>
                    <span className="font-medium">{latestAssessment.operationalScore}/3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate700">Trust</span>
                    <span className="font-medium">{latestAssessment.trustScore}/2</span>
                  </div>
                </div>

                {latestAssessment.conditions && latestAssessment.conditions.length > 0 && (
                  <div className="pt-4 border-t border-slate700/10">
                    <p className="text-xs text-slate700/70 uppercase mb-2">Conditions</p>
                    <ul className="text-sm space-y-1">
                      {latestAssessment.conditions.map((condition, i) => (
                        <li key={i} className="text-conditional">
                          • {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href={`/assessments/${latestAssessment.id}`}>
                  <Button variant="outline" className="w-full">
                    View Full Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate700/70">Created</span>
                <span>{formatDate(vendor.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate700/70">Last Updated</span>
                <span>{formatDate(vendor.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate700/70">Assessments</span>
                <span>{assessments.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
