'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, ScoreDisplay, VerdictBadge, TextArea } from '@/components/ui';
import { QuestionCard } from './QuestionCard';
import {
  CategoryAnswers,
  QuestionAnswer,
  VendorVerdict
} from '@/types';
import {
  COMPLIANCE_QUESTIONS,
  SECURITY_QUESTIONS,
  OPERATIONAL_QUESTIONS,
  TRUST_QUESTIONS,
  CATEGORY_METADATA,
  MAX_TOTAL_SCORE
} from '@/lib/questions';
import { scoreAssessment } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface AssessmentFormProps {
  initialComplianceAnswers?: CategoryAnswers;
  initialSecurityAnswers?: CategoryAnswers;
  initialOperationalAnswers?: CategoryAnswers;
  initialTrustAnswers?: CategoryAnswers;
  onSave: (data: {
    complianceAnswers: CategoryAnswers;
    securityAnswers: CategoryAnswers;
    operationalAnswers: CategoryAnswers;
    trustAnswers: CategoryAnswers;
    verdictNotes?: string;
  }) => Promise<void>;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
  vendorSelfService?: boolean;
}

export function AssessmentForm({
  initialComplianceAnswers = {},
  initialSecurityAnswers = {},
  initialOperationalAnswers = {},
  initialTrustAnswers = {},
  onSave,
  onSubmit,
  isSubmitting = false,
  vendorSelfService = false
}: AssessmentFormProps) {
  const [complianceAnswers, setComplianceAnswers] = useState<CategoryAnswers>(initialComplianceAnswers);
  const [securityAnswers, setSecurityAnswers] = useState<CategoryAnswers>(initialSecurityAnswers);
  const [operationalAnswers, setOperationalAnswers] = useState<CategoryAnswers>(initialOperationalAnswers);
  const [trustAnswers, setTrustAnswers] = useState<CategoryAnswers>(initialTrustAnswers);
  const [verdictNotes, setVerdictNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('compliance');
  const [saving, setSaving] = useState(false);

  // Calculate live scores
  const scores = scoreAssessment({
    complianceAnswers,
    securityAnswers,
    operationalAnswers,
    trustAnswers
  });

  const handleAnswerChange = useCallback((
    category: string,
    questionId: string,
    answer: QuestionAnswer
  ) => {
    switch (category) {
      case 'compliance':
        setComplianceAnswers(prev => ({ ...prev, [questionId]: answer }));
        break;
      case 'security':
        setSecurityAnswers(prev => ({ ...prev, [questionId]: answer }));
        break;
      case 'operational':
        setOperationalAnswers(prev => ({ ...prev, [questionId]: answer }));
        break;
      case 'trust':
        setTrustAnswers(prev => ({ ...prev, [questionId]: answer }));
        break;
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        complianceAnswers,
        securityAnswers,
        operationalAnswers,
        trustAnswers,
        verdictNotes
      });
    } finally {
      setSaving(false);
    }
  };

  const getAnswersForCategory = (category: string) => {
    switch (category) {
      case 'compliance':
        return complianceAnswers;
      case 'security':
        return securityAnswers;
      case 'operational':
        return operationalAnswers;
      case 'trust':
        return trustAnswers;
      default:
        return {};
    }
  };

  const getQuestionsForCategory = (category: string) => {
    switch (category) {
      case 'compliance':
        return COMPLIANCE_QUESTIONS;
      case 'security':
        return SECURITY_QUESTIONS;
      case 'operational':
        return OPERATIONAL_QUESTIONS;
      case 'trust':
        return TRUST_QUESTIONS;
      default:
        return [];
    }
  };

  const getCategoryScore = (category: string) => {
    switch (category) {
      case 'compliance':
        return scores.complianceScore;
      case 'security':
        return scores.securityScore;
      case 'operational':
        return scores.operationalScore;
      case 'trust':
        return scores.trustScore;
      default:
        return 0;
    }
  };

  const categories = ['compliance', 'security', 'operational', 'trust'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {categories.map((cat) => {
            const meta = CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA];
            const catScore = getCategoryScore(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
                  activeCategory === cat
                    ? 'bg-navy text-white'
                    : 'bg-white text-slate700 hover:bg-ice border border-slate700/20'
                )}
              >
                <span className="mr-2">{meta.icon}</span>
                {meta.name}
                <span className="ml-2 opacity-75">
                  ({catScore}/{meta.maxScore})
                </span>
              </button>
            );
          })}
        </div>

        {/* Questions for Active Category */}
        <div className="space-y-4">
          {categories.map((cat) => {
            if (cat !== activeCategory) return null;

            const meta = CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA];
            const questions = getQuestionsForCategory(cat);
            const answers = getAnswersForCategory(cat);

            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{meta.icon}</span>
                  <h2 className="text-xl font-semibold text-navy">
                    {meta.name.toUpperCase()}
                  </h2>
                  <span className="text-lg font-medium text-slate700">
                    Score: {getCategoryScore(cat)}/{meta.maxScore}
                  </span>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      answer={answers[question.id]}
                      onChange={(answer) => handleAnswerChange(cat, question.id, answer)}
                      questionNumber={index + 1}
                      showCriticalWarning={!vendorSelfService}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict Notes (Internal only) */}
        {!vendorSelfService && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                label="Verdict Notes"
                value={verdictNotes}
                onChange={(e) => setVerdictNotes(e.target.value)}
                placeholder="Add any additional notes or justification for the verdict..."
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} variant="outline" loading={saving}>
            Save Progress
          </Button>
          {onSubmit && (
            <Button onClick={onSubmit} loading={isSubmitting}>
              {vendorSelfService ? 'Submit Responses' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar - Live Score Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-6">
          {/* Score Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Score Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-ice rounded-[var(--radius)]">
                <p className="text-4xl font-bold text-navy">
                  {scores.totalScore}/{MAX_TOTAL_SCORE}
                </p>
                <p className="text-sm text-slate700 mt-1">Total Score</p>
              </div>

              <div className="space-y-3">
                <ScoreDisplay
                  label="Compliance"
                  icon={CATEGORY_METADATA.compliance.icon}
                  score={scores.complianceScore}
                  maxScore={CATEGORY_METADATA.compliance.maxScore}
                  variant="compliance"
                />
                <ScoreDisplay
                  label="Security"
                  icon={CATEGORY_METADATA.security.icon}
                  score={scores.securityScore}
                  maxScore={CATEGORY_METADATA.security.maxScore}
                  variant="security"
                />
                <ScoreDisplay
                  label="Operational"
                  icon={CATEGORY_METADATA.operational.icon}
                  score={scores.operationalScore}
                  maxScore={CATEGORY_METADATA.operational.maxScore}
                  variant="operational"
                />
                <ScoreDisplay
                  label="Trust"
                  icon={CATEGORY_METADATA.trust.icon}
                  score={scores.trustScore}
                  maxScore={CATEGORY_METADATA.trust.maxScore}
                  variant="trust"
                />
              </div>
            </CardContent>
          </Card>

          {/* Provisional Verdict */}
          {!vendorSelfService && (
            <Card>
              <CardHeader>
                <CardTitle>Provisional Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <VerdictBadge verdict={scores.verdict} />
                  <span className={cn(
                    'text-sm font-medium',
                    scores.verdict === VendorVerdict.Approved && 'text-approved',
                    scores.verdict === VendorVerdict.Conditional && 'text-conditional',
                    scores.verdict === VendorVerdict.Rejected && 'text-rejected'
                  )}>
                    {scores.totalScore >= 9 ? 'Low Risk' :
                      scores.totalScore >= 5 ? 'Medium Risk' : 'High Risk'}
                  </span>
                </div>

                {scores.conditions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate700/10">
                    <p className="text-xs text-slate700/70 uppercase mb-2">
                      Auto-Generated Conditions
                    </p>
                    <ul className="space-y-1">
                      {scores.conditions.map((condition, i) => (
                        <li key={i} className="text-sm text-conditional flex items-start gap-2">
                          <span>•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate700/10 text-xs text-slate700/70">
                  <p className="mb-2"><strong>Thresholds:</strong></p>
                  <ul className="space-y-1">
                    <li>✅ Approved: 9-11 points</li>
                    <li>⚠️ Conditional: 5-8 points</li>
                    <li>❌ Rejected: 0-4 points</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentForm;
