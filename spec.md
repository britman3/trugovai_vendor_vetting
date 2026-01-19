# TruGovAI™ AI Vendor Vetting Checklist

# TruGovAI™ vendor vetting — Authoritative Specification

This document is the single source of truth for this application.

## Mandatory Implementation Rules

The implementing agent MUST follow these rules:

1. Implement the application exactly as specified in this document.
2. Do NOT invent features, screens, fields, workflows, or data models.
3. Do NOT remove, simplify, or reinterpret any requirement.
4. Do NOT change the tech stack, libraries, or architecture unless explicitly required to make the app run.
5. If any requirement is ambiguous or technically conflicting, STOP and ask a clarification question before proceeding.
6. Build incrementally and confirm completion of each major section before moving on.
7. If assumptions conflict with this document, THIS DOCUMENT WINS.

## Scope Control

- This specification defines **v1 only**.
- Features listed under *Future Considerations* must NOT be implemented.
- Assume a **single-organisation context** (no multi-tenancy UI or logic in v1).

## Authority & Compliance

- File name: `SPEC.md`
- Status: **Authoritative / Contractual**
- Any deviation from this document is considered an error.

Proceed only after confirming full understanding of this specification.



## Project Overview

Build a web application for conducting structured due diligence on AI vendors before approval. The app guides procurement, IT, and compliance teams through a standardised vetting process, produces a scored verdict (Approved/Conditional/Rejected), and maintains a searchable registry of all vendor assessments.

**Target users:** 
- **Internal:** Procurement, IT Security, Compliance, Legal teams
- **External:** Vendors completing self-service questionnaires

**Core value:** Replace ad-hoc vendor evaluation with a defensible, documented process that satisfies regulators, auditors, and boards.

**Integration:** Approved vendors feed into the AI Tool Inventory's "Approved Tools List" and inform the Acceptable Use Policy.

---

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express (or Next.js API routes)
- **Database:** PostgreSQL (with Prisma ORM) — shared with other TruGovAI apps
- **Auth:** NextAuth.js or Clerk (internal users)
- **Public Access:** Token-based links for vendor self-service (no auth required)
- **Export:** PDF report generation

---

## Brand Guidelines

### Colours (use these exact hex values)

```css
:root {
  /* Primary */
  --navy: #0F2A3A;        /* Primary background, headers */
  --teal: #1AA7A1;        /* Primary accent, buttons, links */
  --ice: #F4F7F9;         /* Light background */
  
  /* Secondary */
  --slate700: #4C5D6B;    /* Body text on light backgrounds */
  --mint300: #71D1C8;     /* Charts, secondary accent */
  
  /* Verdict colours */
  --approved: #7BC96F;    /* Approved (Green) */
  --conditional: #F59E0B; /* Conditional (Amber) */
  --rejected: #FF6B6B;    /* Rejected (Red) */
  
  /* Category colours */
  --compliance: #6366F1;  /* Indigo - Data & Compliance */
  --security: #EF4444;    /* Red - Security */
  --operational: #F59E0B; /* Amber - Operational */
  --trust: #10B981;       /* Emerald - Trust & Transparency */
  
  /* UI */
  --radius: 14px;
  --shadow: 0 8px 24px rgba(0,0,0,0.08);
}
```

### Typography
- **Primary font:** Inter (fallback: system-ui, sans-serif)
- **Scale:** H1 44px | H2 32px | H3 24px | Body 16px | Small 14px

---

## Data Model

### Vendor

```typescript
interface Vendor {
  id: string;                    // UUID
  name: string;                  // e.g., "OpenAI", "Anthropic"
  website: string;               // e.g., "https://openai.com"
  description: string;           // Brief description of what they offer
  
  // Products (a vendor may have multiple products)
  products: VendorProduct[];
  
  // Contact
  contactName: string | null;
  contactEmail: string | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;             // User who added vendor
}

interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;                  // e.g., "ChatGPT Enterprise", "GPT-4 API"
  description: string;
  category: ProductCategory;
  pricingModel: PricingModel;
}

enum ProductCategory {
  Chatbot = "Chatbot/Assistant",
  Coding = "Coding/Development",
  Writing = "Writing/Content",
  ImageGeneration = "Image Generation",
  VideoGeneration = "Video Generation",
  AudioTranscription = "Audio/Transcription",
  DataAnalysis = "Data Analysis",
  Automation = "Automation",
  Other = "Other"
}

enum PricingModel {
  Free = "Free",
  Freemium = "Freemium",
  Subscription = "Subscription",
  PayPerUse = "Pay-per-use/API",
  Enterprise = "Enterprise/Custom"
}
```

### Vendor Assessment

```typescript
interface VendorAssessment {
  id: string;                    // UUID
  vendorId: string;              // FK to Vendor
  productId: string | null;      // FK to VendorProduct (optional, can assess vendor-level)
  
  // Assessment info
  assessmentType: AssessmentType;
  requestedBy: string;           // Who requested the assessment
  requestReason: string;         // Why vendor is being evaluated
  
  // Category scores
  complianceScore: number;       // 0-3 (count of Yes answers)
  securityScore: number;         // 0-3
  operationalScore: number;      // 0-3
  trustScore: number;            // 0-2
  totalScore: number;            // 0-11
  
  // Answers
  complianceAnswers: CategoryAnswers;
  securityAnswers: CategoryAnswers;
  operationalAnswers: CategoryAnswers;
  trustAnswers: CategoryAnswers;
  
  // Evidence
  evidenceLinks: EvidenceLink[];
  
  // Verdict
  verdict: VendorVerdict;
  verdictNotes: string;          // Justification for verdict
  conditions: string[];          // Required conditions for Conditional approval
  
  // Workflow
  status: AssessmentStatus;
  assessedBy: string | null;     // User who completed assessment
  assessedAt: Date | null;
  reviewedBy: string | null;     // Approver (if required)
  reviewedAt: Date | null;
  
  // Self-service
  vendorToken: string | null;    // Token for vendor self-service link
  vendorSubmittedAt: Date | null;
  
  // Metadata
  createdAt: Date;
  expiresAt: Date | null;        // Assessment validity period
  version: number;
}

interface CategoryAnswers {
  [questionId: string]: {
    answer: 'yes' | 'no' | 'na' | 'unknown';
    evidence: string | null;     // Link or description of evidence
    notes: string | null;
  };
}

interface EvidenceLink {
  id: string;
  label: string;                 // e.g., "SOC 2 Report", "DPA", "Privacy Policy"
  url: string;
  uploadedAt: Date;
}

enum AssessmentType {
  NewVendor = "New Vendor",
  Renewal = "Renewal/Re-assessment",
  Expedited = "Expedited Review"
}

enum VendorVerdict {
  Approved = "Approved",
  Conditional = "Conditional",
  Rejected = "Rejected",
  Pending = "Pending Review"
}

enum AssessmentStatus {
  Draft = "Draft",
  AwaitingVendor = "Awaiting Vendor Response",
  InReview = "In Review",
  AwaitingApproval = "Awaiting Approval",
  Complete = "Complete",
  Expired = "Expired"
}
```

---

## Vetting Questions by Category

### Category A: Data & Compliance (⚖️)

```typescript
const COMPLIANCE_QUESTIONS = [
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
```

### Category B: Security (🔒)

```typescript
const SECURITY_QUESTIONS = [
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
```

### Category C: Operational (⚙️)

```typescript
const OPERATIONAL_QUESTIONS = [
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
```

### Category D: Trust & Transparency (🌍)

```typescript
const TRUST_QUESTIONS = [
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
```

---

## Scoring Logic

### Score Calculation

```typescript
function calculateCategoryScore(answers: CategoryAnswers, questions: Question[]): number {
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

function calculateTotalScore(assessment: VendorAssessment): number {
  return (
    assessment.complianceScore +
    assessment.securityScore +
    assessment.operationalScore +
    assessment.trustScore
  );
}
```

### Verdict Determination

```typescript
function determineVerdict(totalScore: number, answers: AllAnswers): VendorVerdict {
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
```

### Verdict Thresholds

| Score | Verdict | Meaning |
|-------|---------|---------|
| 9-11 | ✅ Approved | Low risk, meets all key criteria |
| 5-8 | ⚠️ Conditional | Medium risk, approved with conditions |
| 0-4 | ❌ Rejected | High risk, do not approve |

### Automatic Conditions for Conditional Approval

```typescript
function generateConditions(assessment: VendorAssessment): string[] {
  const conditions: string[] = [];
  
  if (assessment.complianceAnswers['comp-1']?.answer !== 'yes') {
    conditions.push("Obtain written confirmation of data residency before deployment");
  }
  if (assessment.securityAnswers['sec-2']?.answer !== 'yes') {
    conditions.push("Implement MFA for all user accounts before rollout");
  }
  if (assessment.operationalAnswers['ops-1']?.answer !== 'yes') {
    conditions.push("Negotiate SLA terms before enterprise deployment");
  }
  if (assessment.trustAnswers['trust-2']?.answer !== 'yes') {
    conditions.push("Request vendor's AI ethics documentation before final approval");
  }
  
  return conditions;
}
```

---

## Features & Screens

### 1. Vendor Registry (Home)

**Purpose:** Central directory of all vendors and their assessment status

**Components:**
- **Summary Cards:**
  - Total Vendors
  - Approved Vendors
  - Conditional Vendors
  - Pending Assessments

- **Vendors Table:**
  | Vendor Name | Products | Latest Verdict | Last Assessed | Expires | Actions |
  
  - Verdict shown with colour badge
  - Actions: View, Reassess, Add Product

- **Quick Actions:**
  - "Add New Vendor" button
  - "Start Assessment" button

- **Filters:**
  - By verdict (Approved/Conditional/Rejected/Pending)
  - By category (Chatbot, Coding, etc.)
  - By expiry (Expiring soon)

---

### 2. Add/Edit Vendor

**Purpose:** Create vendor record before assessment

**Form Fields:**
- **Vendor Name** (required)
- **Website** (required)
- **Description** (required)
- **Contact Name** (optional)
- **Contact Email** (optional)

**Products Section:**
- Add multiple products per vendor
- Each product: Name, Description, Category, Pricing Model

---

### 3. Start Assessment

**Purpose:** Initiate vendor vetting process

**Step 1: Select Vendor**
- Search existing vendors or create new
- Select specific product (optional)

**Step 2: Assessment Context**
- Assessment Type: New Vendor / Renewal / Expedited
- Requested By: (auto-filled with current user)
- Request Reason: Why is this vendor being evaluated?
- Department: Which team wants to use this?

**Step 3: Choose Completion Method**
- **Option A:** Complete internally (you answer all questions)
- **Option B:** Send to vendor (generate self-service link)
- **Option C:** Hybrid (vendor provides evidence, you complete assessment)

---

### 4. Assessment Form (Internal)

**Layout:** Single page with collapsible sections or tabbed interface

**For each category (Compliance, Security, Operational, Trust):**

```
┌─────────────────────────────────────────────────────────────┐
│ ⚖️ DATA & COMPLIANCE                              Score: 2/3 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Q1. Does the vendor disclose where data is stored?          │
│                                                             │
│ ○ Yes  ○ No  ○ N/A  ○ Unknown                              │
│                                                             │
│ ⚠️ Red Flag: Unknown data residency creates GDPR risks      │
│                                                             │
│ Evidence: [URL or description________________________]      │
│ Notes:    [Optional notes____________________________]      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Q2. Does the vendor confirm they do NOT retain data         │
│     for model training?                                     │
│                                                             │
│ ○ Yes  ○ No  ○ N/A  ○ Unknown                              │
│                                                             │
│ ⚠️ Red Flag: Data used for training = IP leakage risk       │
│ ⚠️ CRITICAL: "No" answer will result in automatic rejection │
│                                                             │
│ Evidence: [URL or description________________________]      │
│ Notes:    [Optional notes____________________________]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Live Score Display:**
- Category scores update as answers are selected
- Running total shown prominently
- Provisional verdict indicator

**Evidence Upload Section:**
- Add links to key documents (SOC 2 report, DPA, Privacy Policy, etc.)
- Optional file upload for offline documents

---

### 5. Vendor Self-Service Portal

**Purpose:** Allow vendors to complete questionnaire themselves

**Public URL:** `/vendor-assessment/[token]`

**Landing Page:**
- Organisation name (who is requesting)
- Vendor/product being assessed
- Deadline (if set)
- Instructions

**Form:**
- Same questions as internal assessment
- Evidence fields are required (not optional)
- Progress indicator
- Save & continue later functionality

**Submission:**
- Vendor submits responses
- Internal team notified
- Status changes to "In Review"

---

### 6. Assessment Review

**Purpose:** Review vendor-submitted or completed assessment

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│           VENDOR ASSESSMENT REVIEW                          │
│                                                             │
│  Vendor: OpenAI                    Product: ChatGPT Ent.    │
│  Assessed: Jan 2026                Status: In Review        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SCORE SUMMARY                                      │   │
│  │                                                     │   │
│  │  ⚖️ Compliance:    3/3  ████████████  ✓            │   │
│  │  🔒 Security:      3/3  ████████████  ✓            │   │
│  │  ⚙️ Operational:   2/3  ████████░░░░  ⚠            │   │
│  │  🌍 Trust:         1/2  ██████░░░░░░  ⚠            │   │
│  │  ─────────────────────────────────────             │   │
│  │  TOTAL:            9/11                            │   │
│  │                                                     │   │
│  │  PROVISIONAL VERDICT: ✅ APPROVED                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Missing/Flagged Items:                                     │
│  • No SLA documentation provided                           │
│  • AI Ethics Statement not found                           │
│                                                             │
│  Evidence Links:                                            │
│  📎 SOC 2 Type II Report (2025)                            │
│  📎 Data Processing Agreement                              │
│  📎 Privacy Policy                                         │
│                                                             │
│  Reviewer Notes: [____________________________________]    │
│                                                             │
│  [Request More Info]  [Override Verdict ▼]  [Approve]      │
└─────────────────────────────────────────────────────────────┘
```

**Reviewer Actions:**
- Request more information (sends email to vendor contact)
- Override verdict (with justification)
- Add conditions for Conditional approval
- Approve/Reject with final notes

---

### 7. Assessment Result / Certificate

**Purpose:** Shareable assessment outcome

**Content:**
- Vendor name and product
- Assessment date and validity period
- Overall verdict with colour badge
- Score breakdown by category
- Conditions (if Conditional)
- Assessed by / Approved by
- Evidence links

**Actions:**
- Export as PDF
- Share link (read-only)
- Add to Approved Tools List (if approved)

---

### 8. Comparison View

**Purpose:** Compare multiple vendors side-by-side

**Layout:**
| Criteria | Vendor A | Vendor B | Vendor C |
|----------|----------|----------|----------|
| Data Residency | ✅ | ✅ | ❌ |
| No Training on Data | ✅ | ⚠️ | ❌ |
| SOC 2 / ISO 27001 | ✅ | ✅ | ✅ |
| ... | ... | ... | ... |
| **Total Score** | 10/11 | 8/11 | 5/11 |
| **Verdict** | ✅ Approved | ⚠️ Conditional | ⚠️ Conditional |

---

### 9. Expiry & Renewal Management

**Purpose:** Track assessment validity and trigger renewals

**Features:**
- Assessments expire after configurable period (default: 12 months)
- Dashboard widget showing expiring assessments
- Email notifications 30/14/7 days before expiry
- One-click "Reassess" pre-fills previous answers for review

---

## User Flows

### Internal Assessment Flow

1. User clicks "Start Assessment"
2. Selects or creates vendor
3. Sets assessment context (type, reason, department)
4. Chooses "Complete Internally"
5. Answers all 11 questions with evidence
6. Reviews score and provisional verdict
7. Adds any additional notes
8. Submits for approval (if required) or completes directly
9. Assessment saved, PDF available
10. If approved, prompted to add to Approved Tools List

### Vendor Self-Service Flow

1. User clicks "Start Assessment"
2. Selects vendor, sets context
3. Chooses "Send to Vendor"
4. System generates unique link
5. User sends link to vendor contact (or system sends email)
6. Vendor clicks link → sees questionnaire
7. Vendor completes questions with evidence
8. Vendor submits
9. Internal user notified
10. Internal user reviews, requests more info or approves
11. Assessment completed

### Renewal Flow

1. System flags assessment as expiring
2. User clicks "Reassess"
3. Previous answers pre-filled
4. User reviews, updates any changed answers
5. New assessment created (previous marked as Superseded)
6. Verdict recalculated

---

## API Endpoints

```
# Vendors
GET    /api/vendors                        # List all vendors
GET    /api/vendors/:id                    # Get vendor detail
POST   /api/vendors                        # Create vendor
PUT    /api/vendors/:id                    # Update vendor
DELETE /api/vendors/:id                    # Delete vendor (if no assessments)

# Vendor Products
POST   /api/vendors/:id/products           # Add product to vendor
PUT    /api/vendors/:id/products/:pid      # Update product
DELETE /api/vendors/:id/products/:pid      # Delete product

# Assessments
GET    /api/assessments                    # List all assessments
GET    /api/assessments/:id                # Get assessment detail
POST   /api/assessments                    # Create assessment
PUT    /api/assessments/:id                # Update assessment (draft)
POST   /api/assessments/:id/submit         # Submit for review
POST   /api/assessments/:id/approve        # Approve assessment
POST   /api/assessments/:id/reject         # Reject assessment

# Vendor Self-Service (public, token-authenticated)
GET    /api/public/assessment/:token       # Get assessment for vendor
PUT    /api/public/assessment/:token       # Update answers
POST   /api/public/assessment/:token/submit # Vendor submits

# Comparison
POST   /api/assessments/compare            # Compare multiple assessments

# Export
GET    /api/assessments/:id/export/pdf     # Generate PDF report

# Integration
POST   /api/assessments/:id/add-to-inventory # Add approved vendor to inventory
```

---

## Validation Rules

- Vendor name: Required, 2-100 characters, unique
- Website: Required, valid URL format
- All 11 questions must be answered (or marked N/A) to submit
- Evidence required for 'Yes' answers (at least a note or URL)
- Verdict override requires justification (min 20 characters)
- Conditional approval requires at least one condition

---

## Integration with AI Tool Inventory

When a vendor is approved:

1. Option to "Add to Approved Tools List" appears
2. User confirms which product(s) to add
3. System creates AITool entries with:
   - Name: Product name
   - Vendor: Vendor name
   - Status: "Approved"
   - Notes: "Vetted via Vendor Assessment [date]. Score: X/11"
   - Link to assessment for reference

4. Tools appear in Inventory with vetting badge

---

## Sample Data

```json
{
  "vendor": {
    "name": "OpenAI",
    "website": "https://openai.com",
    "description": "AI research company, creator of GPT models and ChatGPT",
    "products": [
      {
        "name": "ChatGPT Enterprise",
        "description": "Enterprise-grade AI assistant with enhanced security",
        "category": "Chatbot/Assistant",
        "pricingModel": "Enterprise/Custom"
      },
      {
        "name": "GPT-4 API",
        "description": "API access to GPT-4 language model",
        "category": "Chatbot/Assistant",
        "pricingModel": "Pay-per-use/API"
      }
    ]
  },
  "assessment": {
    "productId": "chatgpt-enterprise-uuid",
    "assessmentType": "New Vendor",
    "requestReason": "Marketing team wants to use for content creation",
    "complianceAnswers": {
      "comp-1": { "answer": "yes", "evidence": "https://openai.com/enterprise-privacy", "notes": "US and EU data centers available" },
      "comp-2": { "answer": "yes", "evidence": "https://openai.com/enterprise-privacy#data-usage", "notes": "Enterprise plan excludes training" },
      "comp-3": { "answer": "yes", "evidence": "https://openai.com/security", "notes": "GDPR compliant, DPA available" }
    },
    "securityAnswers": {
      "sec-1": { "answer": "yes", "evidence": "https://openai.com/security", "notes": "SOC 2 Type II certified" },
      "sec-2": { "answer": "yes", "evidence": "https://openai.com/enterprise", "notes": "SAML SSO and MFA supported" },
      "sec-3": { "answer": "yes", "evidence": "https://openai.com/security", "notes": "AES-256 at rest, TLS 1.2+ in transit" }
    },
    "operationalAnswers": {
      "ops-1": { "answer": "yes", "evidence": "https://openai.com/policies/service-terms", "notes": "99.9% uptime SLA" },
      "ops-2": { "answer": "yes", "evidence": "https://help.openai.com", "notes": "Dedicated support for enterprise" },
      "ops-3": { "answer": "yes", "evidence": "https://platform.openai.com/docs/guides/rate-limits", "notes": "Clear rate limit documentation" }
    },
    "trustAnswers": {
      "trust-1": { "answer": "yes", "evidence": "https://openai.com/research", "notes": "Model cards and research published" },
      "trust-2": { "answer": "yes", "evidence": "https://openai.com/charter", "notes": "OpenAI Charter published" }
    },
    "totalScore": 11,
    "verdict": "Approved"
  }
}
```

---

## Email Notifications

| Trigger | Recipient | Content |
|---------|-----------|---------|
| Assessment created | Requester | Confirmation, link to assessment |
| Vendor link generated | Vendor contact | Instructions, link, deadline |
| Vendor submitted | Internal reviewer | Notification, link to review |
| More info requested | Vendor contact | Questions needing clarification |
| Assessment approved | Requester | Verdict, conditions (if any), PDF |
| Assessment rejected | Requester | Verdict, reasons, next steps |
| Assessment expiring | Owner | 30/14/7 day reminders |

---

## Non-Functional Requirements

- Self-service links should be single-use or time-limited
- Vendor responses should be saved on each field change (auto-save)
- PDF export should complete in <5 seconds
- Support bulk export of all approved vendors
- Assessment history retained indefinitely for audit

---

## Security Considerations

- Vendor self-service tokens should be:
  - Cryptographically random (UUID v4 or better)
  - Single-use or time-limited (7 days default)
  - Revocable by admin
- Evidence links should be validated (no script injection)
- Assessment data should be access-controlled by organisation
- Audit log all verdict changes and overrides

---

## Future Considerations (don't build now)

- Vendor risk scoring based on public data (news, breaches)
- Integration with vendor security platforms (SecurityScorecard, etc.)
- Automated re-assessment based on vendor changelog monitoring
- Vendor portal for managing multiple customer assessments
- Assessment templates for different risk appetites

---

## Success Criteria

1. User can create vendor and complete assessment in <10 minutes
2. Scoring calculates correctly with proper verdict
3. Vendor self-service flow works end-to-end
4. PDF export produces professional, branded report
5. Approved vendors can be added to Inventory
6. Expiry tracking and notifications work correctly
7. Comparison view accurately shows side-by-side

---

## Getting Started

1. Extend Prisma schema for Vendor and Assessment models
2. Build vendor CRUD pages
3. Build assessment form with live scoring
4. Implement verdict logic with conditions
5. Build vendor self-service portal
6. Add review/approval workflow
7. Build PDF export
8. Add comparison feature
9. Implement expiry notifications
10. Test and polish

---

*Part of the TruGovAI™ Toolkit — "Board-ready AI governance in 30 days"*
