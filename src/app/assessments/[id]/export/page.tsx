'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VendorAssessment, Vendor, VendorProduct, CategoryAnswers } from '@/types';
import { formatDate } from '@/lib/utils';
import { COMPLIANCE_QUESTIONS, SECURITY_QUESTIONS, OPERATIONAL_QUESTIONS, TRUST_QUESTIONS, CATEGORY_METADATA, MAX_TOTAL_SCORE } from '@/lib/questions';

export default function AssessmentExportPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<VendorAssessment | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      const data = await response.json();

      if (data.success) {
        setAssessment(data.data);
        setVendor(data.data.vendor);
        setProduct(data.data.product);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger print dialog when loaded
    if (!loading && assessment) {
      window.print();
    }
  }, [loading, assessment]);

  const renderAnswers = (answers: CategoryAnswers, questions: typeof COMPLIANCE_QUESTIONS) => {
    return questions.map(q => {
      const answer = answers[q.id];
      return (
        <tr key={q.id}>
          <td style={{ padding: '8px', borderBottom: '1px solid #e5e5e5' }}>
            {q.question}
          </td>
          <td style={{ padding: '8px', borderBottom: '1px solid #e5e5e5', textAlign: 'center', width: '100px' }}>
            {answer?.answer === 'yes' ? '✅ Yes' :
              answer?.answer === 'no' ? '❌ No' :
                answer?.answer === 'na' ? '➖ N/A' :
                  '❓ Unknown'}
          </td>
          <td style={{ padding: '8px', borderBottom: '1px solid #e5e5e5', width: '200px', fontSize: '12px' }}>
            {answer?.evidence && (
              <a href={answer.evidence} style={{ color: '#1AA7A1' }}>{answer.evidence}</a>
            )}
            {answer?.notes && <p style={{ margin: '4px 0 0 0', color: '#666' }}>{answer.notes}</p>}
          </td>
        </tr>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading assessment...
      </div>
    );
  }

  if (!assessment || !vendor) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Assessment not found
      </div>
    );
  }

  const verdictColors = {
    Approved: '#7BC96F',
    Conditional: '#F59E0B',
    Rejected: '#FF6B6B',
    'Pending Review': '#4C5D6B'
  };

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      color: '#4C5D6B'
    }}>
      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 1cm; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1AA7A1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4C5D6B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>

      {/* Header */}
      <div style={{
        backgroundColor: '#0F2A3A',
        color: 'white',
        padding: '30px',
        borderRadius: '14px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#1AA7A1',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>T</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>TruGovAI™</h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Vendor Assessment Report</p>
          </div>
        </div>

        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{vendor.name}</h2>
        {product && <p style={{ margin: 0, opacity: 0.8 }}>Product: {product.name}</p>}
      </div>

      {/* Verdict Summary */}
      <div style={{
        backgroundColor: verdictColors[assessment.verdict as keyof typeof verdictColors] + '15',
        border: `2px solid ${verdictColors[assessment.verdict as keyof typeof verdictColors]}`,
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0F2A3A' }}>Assessment Verdict</h3>
        <div style={{
          display: 'inline-block',
          padding: '10px 30px',
          backgroundColor: verdictColors[assessment.verdict as keyof typeof verdictColors],
          color: 'white',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {assessment.verdict === 'Approved' && '✅ '}
          {assessment.verdict === 'Conditional' && '⚠️ '}
          {assessment.verdict === 'Rejected' && '❌ '}
          {assessment.verdict}
        </div>
        <p style={{ margin: '15px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#0F2A3A' }}>
          {assessment.totalScore} / {MAX_TOTAL_SCORE}
        </p>
        <p style={{ margin: '5px 0 0 0', color: '#4C5D6B' }}>Total Score</p>
      </div>

      {/* Score Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: '#6366F115', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#6366F1', fontWeight: 'bold' }}>⚖️ Compliance</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#0F2A3A' }}>
            {assessment.complianceScore}/3
          </p>
        </div>
        <div style={{ backgroundColor: '#EF444415', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#EF4444', fontWeight: 'bold' }}>🔒 Security</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#0F2A3A' }}>
            {assessment.securityScore}/3
          </p>
        </div>
        <div style={{ backgroundColor: '#F59E0B15', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#F59E0B', fontWeight: 'bold' }}>⚙️ Operational</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#0F2A3A' }}>
            {assessment.operationalScore}/3
          </p>
        </div>
        <div style={{ backgroundColor: '#10B98115', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#10B981', fontWeight: 'bold' }}>🌍 Trust</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#0F2A3A' }}>
            {assessment.trustScore}/2
          </p>
        </div>
      </div>

      {/* Conditions */}
      {assessment.conditions && assessment.conditions.length > 0 && (
        <div style={{
          backgroundColor: '#F59E0B15',
          border: '1px solid #F59E0B30',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0F2A3A' }}>⚠️ Conditions for Approval</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {assessment.conditions.map((condition, i) => (
              <li key={i} style={{ marginBottom: '8px', color: '#F59E0B' }}>{condition}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Assessment Details */}
      <div style={{
        backgroundColor: '#F4F7F9',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#0F2A3A' }}>Assessment Details</h3>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0', width: '150px', color: '#4C5D6B' }}>Type:</td>
              <td style={{ fontWeight: '500' }}>{assessment.assessmentType}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Requested By:</td>
              <td style={{ fontWeight: '500' }}>{assessment.requestedBy}</td>
            </tr>
            {assessment.department && (
              <tr>
                <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Department:</td>
                <td style={{ fontWeight: '500' }}>{assessment.department}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Created:</td>
              <td style={{ fontWeight: '500' }}>{formatDate(assessment.createdAt)}</td>
            </tr>
            {assessment.assessedAt && (
              <tr>
                <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Assessed:</td>
                <td style={{ fontWeight: '500' }}>{formatDate(assessment.assessedAt)}</td>
              </tr>
            )}
            {assessment.reviewedAt && (
              <tr>
                <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Approved:</td>
                <td style={{ fontWeight: '500' }}>{formatDate(assessment.reviewedAt)}</td>
              </tr>
            )}
            {assessment.expiresAt && (
              <tr>
                <td style={{ padding: '5px 0', color: '#4C5D6B' }}>Expires:</td>
                <td style={{ fontWeight: '500' }}>{formatDate(assessment.expiresAt)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Answers */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#0F2A3A', marginBottom: '15px' }}>Detailed Assessment</h3>

        {/* Compliance */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ backgroundColor: '#6366F1', color: 'white', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
            ⚖️ Data & Compliance ({assessment.complianceScore}/3)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F7F9' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Question</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e5e5' }}>Answer</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Evidence/Notes</th>
              </tr>
            </thead>
            <tbody>
              {renderAnswers(assessment.complianceAnswers, COMPLIANCE_QUESTIONS)}
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
            🔒 Security ({assessment.securityScore}/3)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F7F9' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Question</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e5e5' }}>Answer</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Evidence/Notes</th>
              </tr>
            </thead>
            <tbody>
              {renderAnswers(assessment.securityAnswers, SECURITY_QUESTIONS)}
            </tbody>
          </table>
        </div>

        {/* Operational */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ backgroundColor: '#F59E0B', color: 'white', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
            ⚙️ Operational ({assessment.operationalScore}/3)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F7F9' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Question</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e5e5' }}>Answer</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Evidence/Notes</th>
              </tr>
            </thead>
            <tbody>
              {renderAnswers(assessment.operationalAnswers, OPERATIONAL_QUESTIONS)}
            </tbody>
          </table>
        </div>

        {/* Trust */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
            🌍 Trust & Transparency ({assessment.trustScore}/2)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F7F9' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Question</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e5e5' }}>Answer</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e5e5' }}>Evidence/Notes</th>
              </tr>
            </thead>
            <tbody>
              {renderAnswers(assessment.trustAnswers, TRUST_QUESTIONS)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviewer Notes */}
      {assessment.verdictNotes && (
        <div style={{
          backgroundColor: '#F4F7F9',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0F2A3A' }}>Reviewer Notes</h3>
          <p style={{ margin: 0 }}>{assessment.verdictNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e5e5',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#4C5D6B',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 5px 0' }}>
          Generated by TruGovAI™ Vendor Vetting on {formatDate(new Date())}
        </p>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Part of the TruGovAI™ Toolkit — &quot;Board-ready AI governance in 30 days&quot;
        </p>
      </div>
    </div>
  );
}
