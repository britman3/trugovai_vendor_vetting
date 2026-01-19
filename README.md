# TruGovAI™ Vendor Vetting

AI Vendor Vetting Checklist - A web application for conducting structured due diligence on AI vendors before approval.

## Overview

This application guides procurement, IT, and compliance teams through a standardised vetting process, produces a scored verdict (Approved/Conditional/Rejected), and maintains a searchable registry of all vendor assessments.

## Features

- **Vendor Registry**: Central directory of all AI vendors and their assessment status
- **Structured Assessment**: 11 questions across 4 categories (Compliance, Security, Operational, Trust)
- **Live Scoring**: Real-time score calculation as answers are provided
- **Automated Verdicts**: Score-based verdict determination with automatic conditions
- **Vendor Self-Service**: Token-based links for vendors to complete questionnaires
- **Comparison View**: Side-by-side comparison of multiple vendors
- **PDF Export**: Professional assessment reports for sharing
- **Expiry Tracking**: Assessment validity periods with renewal reminders

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM (mock data included for demo)
- **Styling**: Custom CSS variables following brand guidelines

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Database Setup (Optional)

For production use with PostgreSQL:

```bash
# Set DATABASE_URL in .env
# Run Prisma migrations
npx prisma generate
npx prisma db push
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── assessments/       # Assessment pages
│   ├── vendors/           # Vendor pages
│   └── vendor-assessment/ # Public vendor self-service
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── assessments/      # Assessment-specific components
│   └── layout/           # Layout components
├── lib/                   # Utilities and business logic
│   ├── questions.ts      # Vetting questions
│   ├── scoring.ts        # Score calculation
│   └── mockData.ts       # Demo data
└── types/                 # TypeScript types
```

## Scoring System

| Score | Verdict | Risk Level |
|-------|---------|------------|
| 9-11 | Approved | Low Risk |
| 5-8 | Conditional | Medium Risk |
| 0-4 | Rejected | High Risk |

## Brand Colors

- **Navy** (#0F2A3A): Primary background, headers
- **Teal** (#1AA7A1): Primary accent, buttons
- **Ice** (#F4F7F9): Light background
- **Approved** (#7BC96F): Green for approved vendors
- **Conditional** (#F59E0B): Amber for conditional approval
- **Rejected** (#FF6B6B): Red for rejected vendors

---

*Part of the TruGovAI™ Toolkit — "Board-ready AI governance in 30 days"*
