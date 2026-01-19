import {
  CategoryAnswers,
  VendorVerdict,
  VettingQuestion,
  VendorAssessment
} from '@/types';
import {
  COMPLIANCE_QUESTIONS,
  SECURITY_QUESTIONS,
  OPERATIONAL_QUESTIONS,
  TRUST_QUESTIONS
} from './questions';

// ========================
// Score Calculation
// ========================

export function calculateCategoryScore(
  answers: CategoryAnswers,
  questions: VettingQuestion[]
): number {
  let score = 0;

  questions.forEach(q => {
    const answer = answers[q.id];
    if (answer && answer.answer === 'yes') {
      score += q.weight;
    }
    // 'no', 'na', 'unknown' = 0 points
  });

  return score;
}

export function calculateAllScores(
  complianceAnswers: CategoryAnswers,
  securityAnswers: CategoryAnswers,
  operationalAnswers: CategoryAnswers,
  trustAnswers: CategoryAnswers
): {
  complianceScore: number;
  securityScore: number;
  operationalScore: number;
  trustScore: number;
  totalScore: number;
} {
  const complianceScore = calculateCategoryScore(complianceAnswers, COMPLIANCE_QUESTIONS);
  const securityScore = calculateCategoryScore(securityAnswers, SECURITY_QUESTIONS);
  const operationalScore = calculateCategoryScore(operationalAnswers, OPERATIONAL_QUESTIONS);
  const trustScore = calculateCategoryScore(trustAnswers, TRUST_QUESTIONS);

  const totalScore = complianceScore + securityScore + operationalScore + trustScore;

  return {
    complianceScore,
    securityScore,
    operationalScore,
    trustScore,
    totalScore
  };
}

// ========================
// Verdict Determination
// ========================

interface AllAnswers {
  compliance: CategoryAnswers;
  security: CategoryAnswers;
  operational: CategoryAnswers;
  trust: CategoryAnswers;
}

export function determineVerdict(
  totalScore: number,
  answers: AllAnswers
): VendorVerdict {
  // Hard reject conditions (regardless of score)
  const criticalFailures = [
    answers.compliance['comp-2']?.answer === 'no',  // Uses data for training
    answers.security['sec-1']?.answer === 'no',     // No security certification
  ];

  if (criticalFailures.some(f => f)) {
    return VendorVerdict.Rejected;
  }

  // Score-based verdict
  if (totalScore >= 9) {
    return VendorVerdict.Approved;        // 9-11 = Low Risk
  } else if (totalScore >= 5) {
    return VendorVerdict.Conditional;     // 5-8 = Medium Risk
  } else {
    return VendorVerdict.Rejected;        // 0-4 = High Risk
  }
}

// ========================
// Condition Generation
// ========================

export function generateConditions(
  complianceAnswers: CategoryAnswers,
  securityAnswers: CategoryAnswers,
  operationalAnswers: CategoryAnswers,
  trustAnswers: CategoryAnswers
): string[] {
  const conditions: string[] = [];

  if (complianceAnswers['comp-1']?.answer !== 'yes') {
    conditions.push("Obtain written confirmation of data residency before deployment");
  }
  if (securityAnswers['sec-2']?.answer !== 'yes') {
    conditions.push("Implement MFA for all user accounts before rollout");
  }
  if (operationalAnswers['ops-1']?.answer !== 'yes') {
    conditions.push("Negotiate SLA terms before enterprise deployment");
  }
  if (trustAnswers['trust-2']?.answer !== 'yes') {
    conditions.push("Request vendor's AI ethics documentation before final approval");
  }

  return conditions;
}

// ========================
// Assessment Scoring Helper
// ========================

export function scoreAssessment(assessment: {
  complianceAnswers: CategoryAnswers;
  securityAnswers: CategoryAnswers;
  operationalAnswers: CategoryAnswers;
  trustAnswers: CategoryAnswers;
}): {
  complianceScore: number;
  securityScore: number;
  operationalScore: number;
  trustScore: number;
  totalScore: number;
  verdict: VendorVerdict;
  conditions: string[];
} {
  const scores = calculateAllScores(
    assessment.complianceAnswers,
    assessment.securityAnswers,
    assessment.operationalAnswers,
    assessment.trustAnswers
  );

  const verdict = determineVerdict(scores.totalScore, {
    compliance: assessment.complianceAnswers,
    security: assessment.securityAnswers,
    operational: assessment.operationalAnswers,
    trust: assessment.trustAnswers
  });

  const conditions = verdict === VendorVerdict.Conditional
    ? generateConditions(
        assessment.complianceAnswers,
        assessment.securityAnswers,
        assessment.operationalAnswers,
        assessment.trustAnswers
      )
    : [];

  return {
    ...scores,
    verdict,
    conditions
  };
}

// ========================
// Verdict Helpers
// ========================

export function getVerdictColor(verdict: VendorVerdict): string {
  switch (verdict) {
    case VendorVerdict.Approved:
      return 'var(--approved)';
    case VendorVerdict.Conditional:
      return 'var(--conditional)';
    case VendorVerdict.Rejected:
      return 'var(--rejected)';
    case VendorVerdict.Pending:
    default:
      return 'var(--slate700)';
  }
}

export function getVerdictBgClass(verdict: VendorVerdict): string {
  switch (verdict) {
    case VendorVerdict.Approved:
      return 'bg-approved/10 text-approved border-approved/20';
    case VendorVerdict.Conditional:
      return 'bg-conditional/10 text-conditional border-conditional/20';
    case VendorVerdict.Rejected:
      return 'bg-rejected/10 text-rejected border-rejected/20';
    case VendorVerdict.Pending:
    default:
      return 'bg-slate700/10 text-slate700 border-slate700/20';
  }
}

export function getVerdictIcon(verdict: VendorVerdict): string {
  switch (verdict) {
    case VendorVerdict.Approved:
      return '✅';
    case VendorVerdict.Conditional:
      return '⚠️';
    case VendorVerdict.Rejected:
      return '❌';
    case VendorVerdict.Pending:
    default:
      return '⏳';
  }
}

// ========================
// Risk Level
// ========================

export function getRiskLevel(totalScore: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
} {
  if (totalScore >= 9) {
    return { level: 'low', label: 'Low Risk', color: 'var(--approved)' };
  } else if (totalScore >= 5) {
    return { level: 'medium', label: 'Medium Risk', color: 'var(--conditional)' };
  } else {
    return { level: 'high', label: 'High Risk', color: 'var(--rejected)' };
  }
}

// ========================
// Validation
// ========================

export function isAssessmentComplete(
  complianceAnswers: CategoryAnswers,
  securityAnswers: CategoryAnswers,
  operationalAnswers: CategoryAnswers,
  trustAnswers: CategoryAnswers
): boolean {
  const allQuestionIds = [
    ...COMPLIANCE_QUESTIONS.map(q => q.id),
    ...SECURITY_QUESTIONS.map(q => q.id),
    ...OPERATIONAL_QUESTIONS.map(q => q.id),
    ...TRUST_QUESTIONS.map(q => q.id)
  ];

  const allAnswers = {
    ...complianceAnswers,
    ...securityAnswers,
    ...operationalAnswers,
    ...trustAnswers
  };

  return allQuestionIds.every(id => {
    const answer = allAnswers[id];
    return answer && answer.answer;
  });
}

export function hasRequiredEvidence(
  complianceAnswers: CategoryAnswers,
  securityAnswers: CategoryAnswers,
  operationalAnswers: CategoryAnswers,
  trustAnswers: CategoryAnswers
): { valid: boolean; missingEvidence: string[] } {
  const missingEvidence: string[] = [];

  const allAnswersWithQuestions = [
    { answers: complianceAnswers, questions: COMPLIANCE_QUESTIONS },
    { answers: securityAnswers, questions: SECURITY_QUESTIONS },
    { answers: operationalAnswers, questions: OPERATIONAL_QUESTIONS },
    { answers: trustAnswers, questions: TRUST_QUESTIONS }
  ];

  allAnswersWithQuestions.forEach(({ answers, questions }) => {
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer?.answer === 'yes' && !answer.evidence && !answer.notes) {
        missingEvidence.push(q.id);
      }
    });
  });

  return {
    valid: missingEvidence.length === 0,
    missingEvidence
  };
}
