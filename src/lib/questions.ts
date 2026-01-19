import { VettingQuestion } from '@/types';

// ========================
// Category A: Data & Compliance
// ========================

export const COMPLIANCE_QUESTIONS: VettingQuestion[] = [
  {
    id: "comp-1",
    question: "Does the vendor disclose where data is stored (region/country)?",
    importance: "critical",
    redFlag: "Unknown data residency creates GDPR/regulatory compliance risks",
    evidenceType: "Link to data residency documentation or privacy policy",
    weight: 1
  },
  {
    id: "comp-2",
    question: "Does the vendor confirm they do NOT retain or reuse customer data for model training?",
    importance: "critical",
    redFlag: "Data used for training = potential IP leakage and privacy violations",
    evidenceType: "Link to data usage policy or enterprise agreement terms",
    weight: 1
  },
  {
    id: "comp-3",
    question: "Does the vendor demonstrate compliance with GDPR/CCPA/relevant data protection laws?",
    importance: "critical",
    redFlag: "No documented compliance creates legal liability",
    evidenceType: "Link to compliance certifications, DPA, or privacy documentation",
    weight: 1
  }
];
// Max score: 3

// ========================
// Category B: Security
// ========================

export const SECURITY_QUESTIONS: VettingQuestion[] = [
  {
    id: "sec-1",
    question: "Does the vendor hold SOC 2 Type II or ISO 27001 certification?",
    importance: "critical",
    redFlag: "No security certification = unverified security controls",
    evidenceType: "Link to certification or audit report summary",
    weight: 1
  },
  {
    id: "sec-2",
    question: "Does the vendor support SSO and/or MFA for user authentication?",
    importance: "high",
    redFlag: "Weak authentication increases account compromise risk",
    evidenceType: "Link to authentication documentation or feature page",
    weight: 1
  },
  {
    id: "sec-3",
    question: "Does the vendor encrypt data in transit (TLS) and at rest (AES-256 or equivalent)?",
    importance: "critical",
    redFlag: "Unencrypted data creates exposure during transmission and storage",
    evidenceType: "Link to security whitepaper or documentation",
    weight: 1
  }
];
// Max score: 3

// ========================
// Category C: Operational
// ========================

export const OPERATIONAL_QUESTIONS: VettingQuestion[] = [
  {
    id: "ops-1",
    question: "Does the vendor provide uptime guarantees (SLAs) of 99.5% or higher?",
    importance: "high",
    redFlag: "No SLA = unpredictable reliability, business continuity risk",
    evidenceType: "Link to SLA documentation or service terms",
    weight: 1
  },
  {
    id: "ops-2",
    question: "Does the vendor offer customer support with defined response times?",
    importance: "medium",
    redFlag: "No support = you're on your own when issues arise",
    evidenceType: "Link to support documentation or plans",
    weight: 1
  },
  {
    id: "ops-3",
    question: "Does the vendor disclose API rate limits, usage caps, or fallback procedures?",
    importance: "medium",
    redFlag: "Unknown limits can cause unexpected service disruptions",
    evidenceType: "Link to API documentation or fair use policy",
    weight: 1
  }
];
// Max score: 3

// ========================
// Category D: Trust & Transparency
// ========================

export const TRUST_QUESTIONS: VettingQuestion[] = [
  {
    id: "trust-1",
    question: "Does the vendor disclose how their AI models are trained (data sources, methodology)?",
    importance: "medium",
    redFlag: "Opaque training creates bias, IP, and ethical concerns",
    evidenceType: "Link to model card, documentation, or public statements",
    weight: 1
  },
  {
    id: "trust-2",
    question: "Does the vendor publish an AI Ethics Statement or Responsible AI policy?",
    importance: "medium",
    redFlag: "No ethics commitment may indicate immature governance",
    evidenceType: "Link to ethics policy or responsible AI page",
    weight: 1
  }
];
// Max score: 2

// ========================
// All Questions
// ========================

export const ALL_QUESTIONS = {
  compliance: COMPLIANCE_QUESTIONS,
  security: SECURITY_QUESTIONS,
  operational: OPERATIONAL_QUESTIONS,
  trust: TRUST_QUESTIONS
};

// ========================
// Category Metadata
// ========================

export const CATEGORY_METADATA = {
  compliance: {
    id: 'compliance',
    name: 'Data & Compliance',
    icon: '⚖️',
    color: 'compliance',
    maxScore: 3
  },
  security: {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    color: 'security',
    maxScore: 3
  },
  operational: {
    id: 'operational',
    name: 'Operational',
    icon: '⚙️',
    color: 'operational',
    maxScore: 3
  },
  trust: {
    id: 'trust',
    name: 'Trust & Transparency',
    icon: '🌍',
    color: 'trust',
    maxScore: 2
  }
};

export const MAX_TOTAL_SCORE = 11;
