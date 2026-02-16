# AUDIT.md — TruGovAI Vendor Vetting

**Audit Date:** 2026-02-16
**Auditor:** Automated (Claude)
**Repo:** `trugovai_vendor_vetting`
**Status:** Pre-implementation — specification only. No application code exists.

---

## 1. Tech Stack

### Current State

No `package.json` exists. No dependencies are installed. The repository contains only:

| File | Purpose |
|------|---------|
| `README.md` | One-line project title |
| `spec.md` | Full authoritative specification (926 lines) |

### Specified Tech Stack (from `spec.md`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Tailwind CSS | Not yet specified |
| Backend | Node.js + Express or Next.js API Routes | Not yet specified |
| Database | PostgreSQL | Not yet specified |
| ORM | Prisma | Not yet specified |
| Auth | NextAuth.js or Clerk | Not yet specified |
| Public Access | Token-based links (no auth) | N/A |
| Export | PDF report generation | Library not specified |

**Framework:** React (likely Next.js given API routes pattern)
**CSS:** Tailwind CSS
**ORM:** Prisma

---

## 2. Database Schema

### Current State

No `prisma/schema.prisma` file exists. No SQL migration files exist. No database is configured.

### Specified Data Model (from `spec.md`)

#### Model: `Vendor`

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| name | string | e.g. "OpenAI", "Anthropic" |
| website | string | e.g. "https://openai.com" |
| description | string | Brief description |
| products | VendorProduct[] | One-to-many relationship |
| contactName | string \| null | Optional |
| contactEmail | string \| null | Optional |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-generated |
| createdBy | string | User who added vendor |

#### Model: `VendorProduct`

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| vendorId | string | FK to Vendor |
| name | string | e.g. "ChatGPT Enterprise" |
| description | string | |
| category | ProductCategory (enum) | See enum values below |
| pricingModel | PricingModel (enum) | See enum values below |

#### Enum: `ProductCategory`

- Chatbot/Assistant
- Coding/Development
- Writing/Content
- Image Generation
- Video Generation
- Audio/Transcription
- Data Analysis
- Automation
- Other

#### Enum: `PricingModel`

- Free
- Freemium
- Subscription
- Pay-per-use/API
- Enterprise/Custom

#### Model: `VendorAssessment`

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| vendorId | string | FK to Vendor |
| productId | string \| null | FK to VendorProduct (optional) |
| assessmentType | AssessmentType (enum) | New Vendor / Renewal / Expedited |
| requestedBy | string | Who requested |
| requestReason | string | Why evaluating |
| complianceScore | number | 0-3 |
| securityScore | number | 0-3 |
| operationalScore | number | 0-3 |
| trustScore | number | 0-2 |
| totalScore | number | 0-11 |
| complianceAnswers | JSON (CategoryAnswers) | Structured answers |
| securityAnswers | JSON (CategoryAnswers) | Structured answers |
| operationalAnswers | JSON (CategoryAnswers) | Structured answers |
| trustAnswers | JSON (CategoryAnswers) | Structured answers |
| evidenceLinks | EvidenceLink[] | Array of links |
| verdict | VendorVerdict (enum) | Approved / Conditional / Rejected / Pending |
| verdictNotes | string | Justification |
| conditions | string[] | For Conditional approval |
| status | AssessmentStatus (enum) | Workflow state |
| assessedBy | string \| null | |
| assessedAt | Date \| null | |
| reviewedBy | string \| null | |
| reviewedAt | Date \| null | |
| vendorToken | string \| null | For self-service link |
| vendorSubmittedAt | Date \| null | |
| createdAt | Date | |
| expiresAt | Date \| null | Assessment validity |
| version | number | |

#### Model: `EvidenceLink`

| Field | Type | Notes |
|-------|------|-------|
| id | string | Primary key |
| label | string | e.g. "SOC 2 Report" |
| url | string | |
| uploadedAt | Date | |

#### Enum: `AssessmentType`

- New Vendor
- Renewal/Re-assessment
- Expedited Review

#### Enum: `VendorVerdict`

- Approved
- Conditional
- Rejected
- Pending Review

#### Enum: `AssessmentStatus`

- Draft
- Awaiting Vendor Response
- In Review
- Awaiting Approval
- Complete
- Expired

#### Relationships

- `Vendor` 1 → N `VendorProduct`
- `Vendor` 1 → N `VendorAssessment`
- `VendorProduct` 0..1 → N `VendorAssessment`
- `VendorAssessment` 1 → N `EvidenceLink`

### DATABASE_URL Format

Not configured. Spec says PostgreSQL (shared with other TruGovAI apps). Expected format:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?schema=public
```

---

## 3. All Pages & Screens

### Current State

No `src/app/`, `src/pages/`, or any source directory exists. Zero pages implemented.

### Specified Pages (from `spec.md`)

#### Frontend Routes (planned)

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Vendor Registry (Home) | Central directory of all vendors and assessment status with summary cards, filters, and vendor table |
| `/vendors/new` | Add Vendor | Form to create a new vendor record with products |
| `/vendors/:id/edit` | Edit Vendor | Edit existing vendor details and products |
| `/assessments/new` | Start Assessment | Multi-step wizard: select vendor, set context, choose completion method |
| `/assessments/:id` | Assessment Form (Internal) | Single page with collapsible/tabbed sections for all 11 vetting questions with live scoring |
| `/assessments/:id/review` | Assessment Review | Review vendor-submitted or completed assessment, approve/reject |
| `/assessments/:id/result` | Assessment Result / Certificate | Shareable assessment outcome with verdict, scores, conditions |
| `/compare` | Comparison View | Side-by-side comparison of multiple vendors |
| `/vendor-assessment/:token` | Vendor Self-Service Portal | Public page for vendors to complete questionnaire (token-authenticated, no login) |

#### API Routes (planned)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/vendors` | List all vendors |
| GET | `/api/vendors/:id` | Get vendor detail |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor (if no assessments) |
| POST | `/api/vendors/:id/products` | Add product to vendor |
| PUT | `/api/vendors/:id/products/:pid` | Update product |
| DELETE | `/api/vendors/:id/products/:pid` | Delete product |
| GET | `/api/assessments` | List all assessments |
| GET | `/api/assessments/:id` | Get assessment detail |
| POST | `/api/assessments` | Create assessment |
| PUT | `/api/assessments/:id` | Update assessment (draft) |
| POST | `/api/assessments/:id/submit` | Submit for review |
| POST | `/api/assessments/:id/approve` | Approve assessment |
| POST | `/api/assessments/:id/reject` | Reject assessment |
| GET | `/api/public/assessment/:token` | Get assessment for vendor (public) |
| PUT | `/api/public/assessment/:token` | Update vendor answers (public) |
| POST | `/api/public/assessment/:token/submit` | Vendor submits (public) |
| POST | `/api/assessments/compare` | Compare multiple assessments |
| GET | `/api/assessments/:id/export/pdf` | Generate PDF report |
| POST | `/api/assessments/:id/add-to-inventory` | Add approved vendor to AI Tool Inventory |

---

## 4. All Components

### Current State

No `src/components/` directory exists. Zero components implemented.

### Specified Components (inferred from `spec.md` screens)

The specification implies the following components will be needed:

| Component | Purpose |
|-----------|---------|
| SummaryCards | Display totals for vendors, approved, conditional, pending |
| VendorsTable | Sortable/filterable table of all vendors with verdict badges |
| VendorForm | Create/edit vendor form with product sub-forms |
| ProductForm | Add/edit product within a vendor (name, description, category, pricing) |
| AssessmentWizard | Multi-step flow for starting an assessment |
| AssessmentForm | Collapsible/tabbed sections for 11 vetting questions |
| QuestionCard | Individual question with radio buttons (Yes/No/N/A/Unknown), evidence, notes |
| LiveScoreDisplay | Real-time score calculation with provisional verdict indicator |
| CategoryScoreBar | Visual score bar per category (Compliance, Security, Operational, Trust) |
| VerdictBadge | Colour-coded badge for Approved/Conditional/Rejected |
| ReviewPanel | Assessment review layout with score summary and reviewer actions |
| ComparisonTable | Side-by-side vendor comparison grid |
| EvidenceLinks | List/add evidence documents with labels and URLs |
| VendorSelfServiceForm | Public questionnaire form with progress indicator and auto-save |
| PDFExportButton | Trigger PDF generation and download |
| FilterBar | Filter vendors by verdict, category, expiry |
| ExpiryWidget | Dashboard widget showing assessments expiring soon |

---

## 5. Business Logic

### Current State

No business logic is implemented. All logic below is specified in `spec.md`.

### Scoring / Calculation Logic

The spec defines a 4-category, 11-question scoring system (max score: 11).

#### Score Calculation (from `spec.md` lines 372-394)

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

#### Verdict Determination (from `spec.md` lines 398-418)

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

#### Automatic Conditions for Conditional Approval (from `spec.md` lines 432-449)

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

#### Verdict Thresholds

| Score Range | Verdict | Risk Level |
|-------------|---------|------------|
| 9-11 | Approved | Low Risk |
| 5-8 | Conditional | Medium Risk |
| 0-4 | Rejected | High Risk |

Hard reject overrides (regardless of score):
- `comp-2` = "No" (vendor uses data for training)
- `sec-1` = "No" (no security certification)

### Vetting Questions (11 total)

**Category A — Data & Compliance (max 3 points):**
1. `comp-1`: Does the vendor disclose where data is stored? (critical)
2. `comp-2`: Does the vendor confirm they do NOT retain/reuse data for training? (critical, hard-reject if No)
3. `comp-3`: Does the vendor demonstrate GDPR/CCPA compliance? (critical)

**Category B — Security (max 3 points):**
4. `sec-1`: Does the vendor hold SOC 2 Type II or ISO 27001? (critical, hard-reject if No)
5. `sec-2`: Does the vendor support SSO and/or MFA? (high)
6. `sec-3`: Does the vendor encrypt data in transit and at rest? (critical)

**Category C — Operational (max 3 points):**
7. `ops-1`: Does the vendor provide 99.5%+ uptime SLAs? (high)
8. `ops-2`: Does the vendor offer support with defined response times? (medium)
9. `ops-3`: Does the vendor disclose rate limits/usage caps? (medium)

**Category D — Trust & Transparency (max 2 points):**
10. `trust-1`: Does the vendor disclose AI training methodology? (medium)
11. `trust-2`: Does the vendor publish an AI Ethics/Responsible AI policy? (medium)

### Export Features

- **PDF:** Assessment result export as PDF report. Library not yet specified in spec.
- **CSV:** Not mentioned in spec.
- **Bulk export:** Spec mentions "support bulk export of all approved vendors" as a non-functional requirement.

### Integrations

- **AI Tool Inventory:** Approved vendors can be added to the AI Tool Inventory's "Approved Tools List" and inform the Acceptable Use Policy. Uses endpoint `POST /api/assessments/:id/add-to-inventory`.

### Email / Notification Features

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

## 6. Auth & Multi-tenancy

### Current State

No authentication or multi-tenancy is implemented.

### Specified Auth (from `spec.md`)

- **Internal users:** NextAuth.js or Clerk (decision not finalized)
- **External (vendor self-service):** Token-based links, no login required
  - Tokens: Cryptographically random (UUID v4+), single-use or time-limited (7-day default), revocable by admin
- **User roles:** Not explicitly defined in v1. Spec mentions "Requester", "Reviewer/Approver" roles implicitly via workflow, but no formal RBAC system is specified.

### Multi-tenancy

- **Explicitly single-organisation in v1.** Spec states: "Assume a single-organisation context (no multi-tenancy UI or logic in v1)."
- Access control by organisation mentioned in security considerations but not in v1 scope.

---

## 7. Config

### Current State

No configuration files exist. No `.env`, no `.env.example`, no `docker-compose.yml`, no `Dockerfile`.

### Specified Configuration

**Port:** Not specified. If Next.js, default would be `3000`.

**Environment Variables (inferred from spec):**

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` or equivalent | Auth secret | Yes (if NextAuth) |
| `NEXTAUTH_URL` | Auth callback URL | Yes (if NextAuth) |
| `CLERK_SECRET_KEY` | Clerk API key | Yes (if Clerk) |
| `SMTP_*` or email service config | Email notifications | Yes |
| `APP_URL` | Base URL for self-service links | Yes |

**Docker:** No Docker configuration exists.

---

## 8. Lines of Code

```
0 total
```

No source code files exist. The repository contains only `README.md` (1 line) and `spec.md` (926 lines) — **927 lines of markdown total, 0 lines of application code.**

---

## 9. UI Patterns

### Current State

No UI is implemented.

### Specified UI Patterns (from `spec.md`)

**Navigation:** Not explicitly specified. Spec describes a home/registry page with table + filters, implying a standard sidebar or top-nav layout. Individual pages for vendor management, assessments, comparison, and self-service portal.

**Chart Library:** Not specified. Score visualization uses bar-style displays (text-based in spec mockups).

**Brand Colours:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--navy` | `#0F2A3A` | Primary background, headers |
| `--teal` | `#1AA7A1` | Primary accent, buttons, links |
| `--ice` | `#F4F7F9` | Light background |
| `--slate700` | `#4C5D6B` | Body text on light backgrounds |
| `--mint300` | `#71D1C8` | Charts, secondary accent |
| `--approved` | `#7BC96F` | Approved verdict (Green) |
| `--conditional` | `#F59E0B` | Conditional verdict (Amber) |
| `--rejected` | `#FF6B6B` | Rejected verdict (Red) |
| `--compliance` | `#6366F1` | Indigo — Data & Compliance category |
| `--security` | `#EF4444` | Red — Security category |
| `--operational` | `#F59E0B` | Amber — Operational category |
| `--trust` | `#10B981` | Emerald — Trust & Transparency category |

**UI Tokens:**

| Token | Value |
|-------|-------|
| `--radius` | `14px` |
| `--shadow` | `0 8px 24px rgba(0,0,0,0.08)` |

**Font:** Inter (fallback: `system-ui, sans-serif`)

**Typography Scale:**

| Element | Size |
|---------|------|
| H1 | 44px |
| H2 | 32px |
| H3 | 24px |
| Body | 16px |
| Small | 14px |

---

## Summary

This repository is in a **pre-implementation state**. It contains a comprehensive 926-line specification document (`spec.md`) that fully defines the data model, business logic, screens, API endpoints, scoring algorithms, and brand guidelines for a vendor vetting application. No application code, dependencies, database schema, configuration, or infrastructure files have been created yet.
