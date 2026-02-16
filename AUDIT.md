# AUDIT.md — TruGovAI Vendor Vetting

**Audit Date:** 2026-02-16
**Auditor:** Automated (Claude)
**Repo:** `trugovai_vendor_vetting`

---

## 1. Branch Info

**Branch containing code:** `claude/implement-spec-AlbbE`

| Branch | Contains Code | Notes |
|--------|:------------:|-------|
| `main` / `master` | No | Only `README.md` (1 line) and `spec.md` (926-line specification) |
| `claude/implement-spec-AlbbE` | **Yes** | Full Next.js application — 45 source files, 7,101 lines |
| `claude/create-audit-docs-DTZbw` | No | Previous audit branch (spec-only analysis) |

---

## 2. Tech Stack

### Dependencies (`package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `16.1.3` | React framework (App Router) |
| `react` | `19.2.3` | UI library |
| `react-dom` | `19.2.3` | React DOM renderer |
| `@prisma/client` | `^7.2.0` | Database ORM client |
| `prisma` | `^7.2.0` | Prisma CLI / schema tooling |
| `@react-pdf/renderer` | `^4.3.2` | PDF generation (React-based) |
| `next-auth` | `^4.24.13` | Auth library (installed but **not used** in code) |
| `date-fns` | `^4.1.0` | Date formatting and utilities |
| `uuid` | `^13.0.0` | UUID generation |
| `@types/uuid` | `^10.0.0` | UUID type definitions |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | `^4` | Utility-first CSS framework |
| `@tailwindcss/postcss` | `^4` | Tailwind PostCSS plugin (v4) |
| `typescript` | `^5` | TypeScript compiler |
| `eslint` | `^9` | Linter |
| `eslint-config-next` | `16.1.3` | Next.js ESLint config |
| `@types/node` | `^20` | Node.js type definitions |
| `@types/react` | `^19` | React type definitions |
| `@types/react-dom` | `^19` | React DOM type definitions |

### Confirmed Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.3 (App Router) |
| **CSS** | Tailwind CSS v4 + CSS custom properties |
| **ORM** | Prisma 7.2.0 (schema defined, client is a placeholder — uses in-memory mock data) |
| **Language** | TypeScript 5 |
| **Runtime** | React 19.2.3 |

---

## 3. Database Schema

### Schema file: `prisma/schema.prisma`

**Provider:** PostgreSQL
**DATABASE_URL format:**

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?schema=public
```

> **Note:** Prisma client is a placeholder (`src/lib/prisma.ts` exports `null`). The app currently runs entirely on **in-memory mock data** (`src/lib/mockData.ts`). The schema is defined but not connected to a live database.

### Models

#### `User`

| Field | Type | Attributes |
|-------|------|-----------|
| `id` | String | `@id @default(uuid())` |
| `email` | String | `@unique` |
| `name` | String? | nullable |
| `role` | UserRole | `@default(USER)` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Relations:** `vendorsCreated`, `assessmentsCreated`, `assessmentsAssessed`, `assessmentsReviewed`

#### `Vendor`

| Field | Type | Attributes |
|-------|------|-----------|
| `id` | String | `@id @default(uuid())` |
| `name` | String | `@unique` |
| `website` | String | |
| `description` | String | |
| `contactName` | String? | nullable |
| `contactEmail` | String? | nullable |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |
| `createdById` | String | FK to User |

**Relations:** `createdBy` (User), `products` (VendorProduct[]), `assessments` (VendorAssessment[])

#### `VendorProduct`

| Field | Type | Attributes |
|-------|------|-----------|
| `id` | String | `@id @default(uuid())` |
| `vendorId` | String | FK to Vendor |
| `name` | String | |
| `description` | String | |
| `category` | ProductCategory | enum |
| `pricingModel` | PricingModel | enum |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Relations:** `vendor` (Vendor, onDelete: Cascade), `assessments` (VendorAssessment[])

#### `VendorAssessment`

| Field | Type | Attributes |
|-------|------|-----------|
| `id` | String | `@id @default(uuid())` |
| `vendorId` | String | FK to Vendor |
| `productId` | String? | FK to VendorProduct, nullable |
| `assessmentType` | AssessmentType | enum |
| `requestedBy` | String | |
| `requestReason` | String | |
| `department` | String? | nullable |
| `complianceScore` | Int | `@default(0)` |
| `securityScore` | Int | `@default(0)` |
| `operationalScore` | Int | `@default(0)` |
| `trustScore` | Int | `@default(0)` |
| `totalScore` | Int | `@default(0)` |
| `complianceAnswers` | Json | `@default("{}")` |
| `securityAnswers` | Json | `@default("{}")` |
| `operationalAnswers` | Json | `@default("{}")` |
| `trustAnswers` | Json | `@default("{}")` |
| `verdict` | VendorVerdict | `@default(Pending)` |
| `verdictNotes` | String? | nullable |
| `conditions` | String[] | `@default([])` |
| `status` | AssessmentStatus | `@default(Draft)` |
| `assessedById` | String? | FK to User, nullable |
| `assessedAt` | DateTime? | nullable |
| `reviewedById` | String? | FK to User, nullable |
| `reviewedAt` | DateTime? | nullable |
| `vendorToken` | String? | `@unique`, nullable |
| `vendorTokenExpiresAt` | DateTime? | nullable |
| `vendorSubmittedAt` | DateTime? | nullable |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |
| `createdById` | String | FK to User |
| `expiresAt` | DateTime? | nullable |
| `version` | Int | `@default(1)` |

**Relations:** `vendor` (Vendor), `product` (VendorProduct?), `createdBy` (User), `assessedBy` (User?), `reviewedBy` (User?), `evidenceLinks` (EvidenceLink[])
**Indexes:** `vendorId`, `status`, `verdict`, `vendorToken`

#### `EvidenceLink`

| Field | Type | Attributes |
|-------|------|-----------|
| `id` | String | `@id @default(uuid())` |
| `assessmentId` | String | FK to VendorAssessment |
| `label` | String | |
| `url` | String | |
| `uploadedAt` | DateTime | `@default(now())` |

**Relations:** `assessment` (VendorAssessment, onDelete: Cascade)

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | `USER`, `REVIEWER`, `ADMIN` |
| `ProductCategory` | `Chatbot`, `Coding`, `Writing`, `ImageGeneration`, `VideoGeneration`, `AudioTranscription`, `DataAnalysis`, `Automation`, `Other` |
| `PricingModel` | `Free`, `Freemium`, `Subscription`, `PayPerUse`, `Enterprise` |
| `AssessmentType` | `NewVendor`, `Renewal`, `Expedited` |
| `VendorVerdict` | `Approved`, `Conditional`, `Rejected`, `Pending` |
| `AssessmentStatus` | `Draft`, `AwaitingVendor`, `InReview`, `AwaitingApproval`, `Complete`, `Expired` |

---

## 4. All Pages & Screens

### Frontend Routes (`src/app/`)

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` (293 lines) | Vendor Registry dashboard — stats cards, filterable vendor table, quick actions |
| `/vendors/new` | `src/app/vendors/new/page.tsx` (272 lines) | Add new vendor form with inline product management |
| `/vendors/[id]` | `src/app/vendors/[id]/page.tsx` (342 lines) | Vendor detail — profile, products list, assessment history, contact sidebar |
| `/assessments` | `src/app/assessments/page.tsx` (199 lines) | List all assessments with status/verdict filters |
| `/assessments/new` | `src/app/assessments/new/page.tsx` (337 lines) | 3-step wizard — select vendor, set context, choose completion method |
| `/assessments/[id]` | `src/app/assessments/[id]/page.tsx` (521 lines) | Assessment review — score breakdown, all answers, approve/reject modals |
| `/assessments/[id]/edit` | `src/app/assessments/[id]/edit/page.tsx` (214 lines) | Edit/complete assessment form with live scoring |
| `/assessments/[id]/export` | `src/app/assessments/[id]/export/page.tsx` (416 lines) | Print-friendly PDF export view with branded layout |
| `/compare` | `src/app/compare/page.tsx` (262 lines) | Side-by-side comparison of 2-5 vendor assessments |
| `/vendor-assessment/[token]` | `src/app/vendor-assessment/[token]/page.tsx` (251 lines) | Public vendor self-service questionnaire (token-authenticated, no login) |

### API Routes (`src/app/api/`)

| Method | Route | File | Description |
|--------|-------|------|-------------|
| GET | `/api/vendors` | `src/app/api/vendors/route.ts` | List all vendors (optional `includeStats` param) |
| POST | `/api/vendors` | `src/app/api/vendors/route.ts` | Create vendor (validates name 2-100 chars, unique, valid URL) |
| GET | `/api/vendors/[id]` | `src/app/api/vendors/[id]/route.ts` | Get vendor with assessments |
| PUT | `/api/vendors/[id]` | `src/app/api/vendors/[id]/route.ts` | Update vendor details |
| DELETE | `/api/vendors/[id]` | `src/app/api/vendors/[id]/route.ts` | Delete vendor (only if no assessments) |
| POST | `/api/vendors/[id]/products` | `src/app/api/vendors/[id]/products/route.ts` | Add product to vendor |
| GET | `/api/assessments` | `src/app/api/assessments/route.ts` | List assessments with filters (vendorId, status, verdict) |
| POST | `/api/assessments` | `src/app/api/assessments/route.ts` | Create assessment with optional vendor token generation |
| GET | `/api/assessments/[id]` | `src/app/api/assessments/[id]/route.ts` | Get assessment with vendor/product enrichment |
| PUT | `/api/assessments/[id]` | `src/app/api/assessments/[id]/route.ts` | Update draft/in-review assessment, recalculates scores |
| POST | `/api/assessments/[id]/submit` | `src/app/api/assessments/[id]/submit/route.ts` | Submit assessment for review (validates completeness + evidence) |
| POST | `/api/assessments/[id]/approve` | `src/app/api/assessments/[id]/approve/route.ts` | Approve with optional verdict override (sets 12-month expiry) |
| POST | `/api/assessments/[id]/reject` | `src/app/api/assessments/[id]/reject/route.ts` | Reject assessment (requires reason, min 20 chars) |
| POST | `/api/assessments/compare` | `src/app/api/assessments/compare/route.ts` | Compare 2-5 assessments with enrichment |
| GET | `/api/public/assessment/[token]` | `src/app/api/public/assessment/[token]/route.ts` | Get assessment for vendor (checks token expiry) |
| PUT | `/api/public/assessment/[token]` | `src/app/api/public/assessment/[token]/route.ts` | Vendor auto-saves answers |
| POST | `/api/public/assessment/[token]/submit` | `src/app/api/public/assessment/[token]/submit/route.ts` | Vendor submits assessment (validates, scores, sets InReview) |

---

## 5. All Components

### UI Components (`src/components/ui/`)

| File | Description |
|------|-------------|
| `Badge.tsx` | Colored status badges with `Badge`, `VerdictBadge` (maps verdict enum to colored icon badge), and `StatusBadge` (maps status enum) |
| `Button.tsx` | Button with variants (primary/secondary/outline/ghost/danger), sizes (sm/md/lg), and loading spinner |
| `Card.tsx` | Container component with sub-components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` |
| `Input.tsx` | Text input with label, error message, helper text, and required indicator |
| `Modal.tsx` | Fullscreen overlay modal with backdrop, title, close button, Escape key support, size variants (sm/md/lg/xl) |
| `ProgressBar.tsx` | Visual progress bar with `ProgressBar` (value/max with percentage label) and `ScoreDisplay` (icon + label + score + status indicator + bar) |
| `RadioGroup.tsx` | Radio button group with inline/stacked layout, label, and error message |
| `Select.tsx` | Dropdown select with label, placeholder, error, helper text, and custom styling |
| `StatsCard.tsx` | Metric card with title, large value, optional icon, optional trend indicator (up/down %), and colored left border variant |
| `Table.tsx` | Semantic table with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableEmpty` (empty state with action) |
| `TextArea.tsx` | Multi-line textarea with label, error, helper text, min-height 100px, resizable |
| `index.ts` | Barrel export for all UI components |

### Assessment Components (`src/components/assessments/`)

| File | Description |
|------|-------------|
| `AssessmentForm.tsx` | Multi-category tabbed assessment form with live scoring sidebar, provisional verdict display, conditions list, save/submit buttons. Supports vendor self-service mode. |
| `QuestionCard.tsx` | Individual question display with radio options (Yes/No/N/A/Unknown), red flag warning, critical "No" warning banner, evidence URL input, notes textarea, and color-coded left border |
| `index.ts` | Barrel export for assessment components |

### Layout Components (`src/components/layout/`)

| File | Description |
|------|-------------|
| `Header.tsx` | Top navigation bar with TruGovAI "T" logo, nav links (Vendor Registry, Assessments), "Start Assessment" CTA button, mobile hamburger menu |
| `Footer.tsx` | Bottom footer with logo, tagline ("Board-ready AI governance in 30 days"), and dynamic copyright year |
| `index.ts` | Barrel export for layout components |

---

## 6. Business Logic

### Scoring / Calculation Logic (`src/lib/scoring.ts`)

**11 questions across 4 categories, max total score: 11**

#### `calculateCategoryScore(answers, questions)` — counts "yes" answers

```typescript
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
```

#### `calculateAllScores(...)` — sums all 4 categories

```typescript
export function calculateAllScores(
  complianceAnswers: CategoryAnswers,
  securityAnswers: CategoryAnswers,
  operationalAnswers: CategoryAnswers,
  trustAnswers: CategoryAnswers
): {
  complianceScore: number;   // 0-3
  securityScore: number;     // 0-3
  operationalScore: number;  // 0-3
  trustScore: number;        // 0-2
  totalScore: number;        // 0-11
} { ... }
```

#### `determineVerdict(totalScore, answers)` — verdict with hard-reject rules

```typescript
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
```

#### `generateConditions(...)` — auto-generates conditions for Conditional verdicts

```typescript
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
```

#### `scoreAssessment(...)` — convenience wrapper combining score + verdict + conditions

```typescript
export function scoreAssessment(assessment: { ... }): {
  complianceScore: number;
  securityScore: number;
  operationalScore: number;
  trustScore: number;
  totalScore: number;
  verdict: VendorVerdict;
  conditions: string[];
} { ... }
```

#### Validation helpers

- `isAssessmentComplete(...)` — checks all 11 questions have an answer
- `hasRequiredEvidence(...)` — checks "yes" answers have evidence or notes

### Verdict Thresholds

| Score | Verdict | Risk Level |
|-------|---------|------------|
| 9-11 | Approved | Low Risk |
| 5-8 | Conditional | Medium Risk |
| 0-4 | Rejected | High Risk |

**Hard reject overrides** (regardless of score):
- `comp-2` answered "No" (vendor uses data for training)
- `sec-1` answered "No" (no security certification)

### Export Features

- **PDF:** `@react-pdf/renderer` (^4.3.2) — React component-based PDF generation
- **Print-to-PDF:** `/assessments/[id]/export` page renders a print-optimized HTML view with `window.print()` button
- **CSV:** Not implemented

### Integrations

- **AI Tool Inventory:** Spec mentions integration (`POST /api/assessments/:id/add-to-inventory`), but this API route is **not implemented** in the current code. The concept exists in the spec only.

### Email / Notification Features

- **Not implemented.** Spec defines 7 email triggers but no email-sending code exists. No SMTP config, no email library installed.

---

## 7. Auth & Multi-tenancy

### Authentication

- `next-auth` (^4.24.13) is **installed** in `package.json` but **not imported or used anywhere** in the codebase. No `[...nextauth]` route exists, no session providers, no `useSession` calls.
- The User model exists in Prisma schema with a `role` field but is not connected to any auth flow.
- **Current state:** No authentication. All operations are unauthenticated.

### User Roles (defined in schema, not enforced)

| Role | Defined In |
|------|-----------|
| `USER` | Prisma enum (default) |
| `REVIEWER` | Prisma enum |
| `ADMIN` | Prisma enum |

These roles exist in the schema but have **no middleware, guards, or checks** in the application code.

### Multi-tenancy

- **None.** Single-organisation context as specified. No tenant model, no org isolation.

### Vendor Self-Service Auth

- Token-based access via URL parameter (`/vendor-assessment/[token]`)
- Tokens checked for expiry (`vendorTokenExpiresAt`) and submission status
- Tokens generated as UUID v4 via `uuid` library
- Default token expiry: 7 days

---

## 8. Config

### Port

- **Default:** `3000` (Next.js default)
- **Alternate:** `3060` (via `npm run dev:3060` or `npm run start:3060`)
- **Production:** `${PORT:-3000}` (reads `PORT` env var, falls back to 3000)

### Scripts

```json
{
  "dev": "next dev",
  "dev:3060": "next dev -p 3060",
  "build": "next build",
  "start": "next start -p ${PORT:-3000}",
  "start:3060": "next start -p 3060",
  "lint": "eslint"
}
```

### Environment Variables

| Variable | Required | Used In | Notes |
|----------|:--------:|---------|-------|
| `DATABASE_URL` | Yes (for Prisma) | `prisma/schema.prisma` | PostgreSQL connection string. Not used at runtime (mock data). |
| `NEXT_PUBLIC_APP_URL` | No | `src/lib/utils.ts` | Base URL for vendor self-service links. Defaults to `http://localhost:3000` |
| `PORT` | No | `package.json` start script | Server port. Defaults to `3000` |

### Docker

- **No Docker configuration.** No `Dockerfile`, no `docker-compose.yml`, no `.dockerignore`.

### Other Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Empty/minimal Next.js config (no custom settings) |
| `tsconfig.json` | TypeScript config; path alias `@/*` → `./src/*`; strict mode; ES2017 target |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` plugin |
| No `tailwind.config.*` | Tailwind v4 configured via `@theme inline` in `globals.css` |

---

## 9. Lines of Code

```
7,101 total
```

Across **45 TypeScript/TSX files** in `src/`.

### Breakdown by directory

| Directory | Files | Purpose |
|-----------|:-----:|---------|
| `src/app/` (pages) | 11 | Page components (2,867 lines) |
| `src/app/api/` (routes) | 11 | API route handlers |
| `src/components/` | 18 | Reusable components |
| `src/lib/` | 5 | Business logic and utilities |
| `src/types/` | 1 | TypeScript type definitions (247 lines) |

---

## 10. UI Patterns

### Navigation Style

- **Top navigation bar** (Header component) — navy background, white text
- Links: Vendor Registry, Assessments
- CTA button: "Start Assessment" (teal)
- Mobile: hamburger menu button (responsive)
- **No sidebar.** No tab-based navigation at the app level.
- Assessment form uses **tabbed interface** within the page (Compliance / Security / Operational / Trust tabs)

### Chart Library

- **None.** No chart library installed or used.
- Score visualization uses custom `ProgressBar` and `ScoreDisplay` components (CSS-based bars, not charts).

### Brand Colours (actual hex values from `src/app/globals.css`)

**Primary:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--navy` | `#0F2A3A` | Primary background, headers |
| `--teal` | `#1AA7A1` | Primary accent, buttons, links |
| `--ice` | `#F4F7F9` | Light background |

**Secondary:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--slate700` | `#4C5D6B` | Body text on light backgrounds |
| `--mint300` | `#71D1C8` | Charts, secondary accent |

**Verdict Colours:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--approved` | `#7BC96F` | Approved (Green) |
| `--conditional` | `#F59E0B` | Conditional (Amber) |
| `--rejected` | `#FF6B6B` | Rejected (Red) |

**Category Colours:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--compliance` | `#6366F1` | Indigo — Data & Compliance |
| `--security` | `#EF4444` | Red — Security |
| `--operational` | `#F59E0B` | Amber — Operational |
| `--trust` | `#10B981` | Emerald — Trust & Transparency |

**UI Tokens:**

| Token | Value |
|-------|-------|
| `--radius` | `14px` |
| `--shadow` | `0 8px 24px rgba(0,0,0,0.08)` |

### Font

- **Primary:** `Inter` (fallback: `system-ui, sans-serif`)
- Declared in both `body` CSS rule and Tailwind `@theme inline` (`--font-sans`)

### Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 44px | 700 | 1.1 |
| H2 | 32px | 600 | 1.2 |
| H3 | 24px | 600 | 1.3 |
| Body | 16px | — | 1.5 |
| Small | 14px | — | — |

---

## Summary

A fully-structured Next.js 16 application with:
- **10 pages** and **17 API endpoints** (11 route files)
- **18 component files** across UI, assessment, and layout categories
- **Complete scoring engine** with 4-category, 11-question assessment system
- **In-memory mock data** (4 vendors, 4 assessments) — Prisma schema defined but DB not connected
- **PDF export** via `@react-pdf/renderer` + print-optimized export page
- **Vendor self-service** via token-based public URLs
- **No authentication** active (next-auth installed but unused)
- **No email notifications** implemented
- **No Docker** configuration
- **7,101 lines** of TypeScript/TSX code
