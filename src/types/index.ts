// ========================
// Enums
// ========================

export enum ProductCategory {
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

export enum PricingModel {
  Free = "Free",
  Freemium = "Freemium",
  Subscription = "Subscription",
  PayPerUse = "Pay-per-use/API",
  Enterprise = "Enterprise/Custom"
}

export enum AssessmentType {
  NewVendor = "New Vendor",
  Renewal = "Renewal/Re-assessment",
  Expedited = "Expedited Review"
}

export enum VendorVerdict {
  Approved = "Approved",
  Conditional = "Conditional",
  Rejected = "Rejected",
  Pending = "Pending Review"
}

export enum AssessmentStatus {
  Draft = "Draft",
  AwaitingVendor = "Awaiting Vendor Response",
  InReview = "In Review",
  AwaitingApproval = "Awaiting Approval",
  Complete = "Complete",
  Expired = "Expired"
}

// ========================
// Answer Types
// ========================

export type AnswerValue = 'yes' | 'no' | 'na' | 'unknown';

export interface QuestionAnswer {
  answer: AnswerValue;
  evidence: string | null;
  notes: string | null;
}

export interface CategoryAnswers {
  [questionId: string]: QuestionAnswer;
}

// ========================
// Question Types
// ========================

export type QuestionImportance = 'critical' | 'high' | 'medium';

export interface VettingQuestion {
  id: string;
  question: string;
  importance: QuestionImportance;
  redFlag: string;
  evidenceType: string;
  weight: number;
}

// ========================
// Evidence Link
// ========================

export interface EvidenceLink {
  id: string;
  label: string;
  url: string;
  uploadedAt: Date;
}

// ========================
// Vendor Product
// ========================

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: ProductCategory;
  pricingModel: PricingModel;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Vendor
// ========================

export interface Vendor {
  id: string;
  name: string;
  website: string;
  description: string;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  products?: VendorProduct[];
}

// ========================
// Vendor Assessment
// ========================

export interface VendorAssessment {
  id: string;
  vendorId: string;
  productId: string | null;

  // Assessment info
  assessmentType: AssessmentType;
  requestedBy: string;
  requestReason: string;
  department?: string | null;

  // Category scores
  complianceScore: number;
  securityScore: number;
  operationalScore: number;
  trustScore: number;
  totalScore: number;

  // Answers
  complianceAnswers: CategoryAnswers;
  securityAnswers: CategoryAnswers;
  operationalAnswers: CategoryAnswers;
  trustAnswers: CategoryAnswers;

  // Evidence
  evidenceLinks?: EvidenceLink[];

  // Verdict
  verdict: VendorVerdict;
  verdictNotes: string | null;
  conditions: string[];

  // Workflow
  status: AssessmentStatus;
  assessedById: string | null;
  assessedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;

  // Self-service
  vendorToken: string | null;
  vendorTokenExpiresAt?: Date | null;
  vendorSubmittedAt: Date | null;

  // Metadata
  createdAt: Date;
  createdById: string;
  expiresAt: Date | null;
  version: number;

  // Relations (when populated)
  vendor?: Vendor;
  product?: VendorProduct | null;
}

// ========================
// Form Data Types
// ========================

export interface VendorFormData {
  name: string;
  website: string;
  description: string;
  contactName?: string;
  contactEmail?: string;
  products?: Omit<VendorProduct, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>[];
}

export interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  pricingModel: PricingModel;
}

export interface AssessmentFormData {
  vendorId: string;
  productId?: string;
  assessmentType: AssessmentType;
  requestedBy: string;
  requestReason: string;
  department?: string;
  completionMethod: 'internal' | 'vendor' | 'hybrid';
}

// ========================
// API Response Types
// ========================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========================
// Summary Stats
// ========================

export interface VendorRegistryStats {
  totalVendors: number;
  approvedVendors: number;
  conditionalVendors: number;
  pendingAssessments: number;
}

// ========================
// Comparison Types
// ========================

export interface ComparisonResult {
  assessments: VendorAssessment[];
  vendors: Vendor[];
}
