import {
  Vendor,
  VendorProduct,
  VendorAssessment,
  ProductCategory,
  PricingModel,
  AssessmentType,
  VendorVerdict,
  AssessmentStatus,
  CategoryAnswers
} from '@/types';

// ========================
// Mock Vendors
// ========================

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'OpenAI',
    website: 'https://openai.com',
    description: 'AI research company, creator of GPT models and ChatGPT',
    contactName: 'Enterprise Sales',
    contactEmail: 'enterprise@openai.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdById: 'user-1',
    products: [
      {
        id: '1-1',
        vendorId: '1',
        name: 'ChatGPT Enterprise',
        description: 'Enterprise-grade AI assistant with enhanced security',
        category: ProductCategory.Chatbot,
        pricingModel: PricingModel.Enterprise
      },
      {
        id: '1-2',
        vendorId: '1',
        name: 'GPT-4 API',
        description: 'API access to GPT-4 language model',
        category: ProductCategory.Chatbot,
        pricingModel: PricingModel.PayPerUse
      }
    ]
  },
  {
    id: '2',
    name: 'Anthropic',
    website: 'https://anthropic.com',
    description: 'AI safety company building reliable AI systems',
    contactName: 'Business Development',
    contactEmail: 'business@anthropic.com',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    createdById: 'user-1',
    products: [
      {
        id: '2-1',
        vendorId: '2',
        name: 'Claude for Enterprise',
        description: 'Enterprise AI assistant with safety focus',
        category: ProductCategory.Chatbot,
        pricingModel: PricingModel.Enterprise
      }
    ]
  },
  {
    id: '3',
    name: 'Midjourney',
    website: 'https://midjourney.com',
    description: 'AI-powered image generation platform',
    contactName: null,
    contactEmail: null,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    createdById: 'user-1',
    products: [
      {
        id: '3-1',
        vendorId: '3',
        name: 'Midjourney',
        description: 'Text-to-image AI generation',
        category: ProductCategory.ImageGeneration,
        pricingModel: PricingModel.Subscription
      }
    ]
  },
  {
    id: '4',
    name: 'GitHub',
    website: 'https://github.com',
    description: 'Development platform with AI coding assistant',
    contactName: 'Sales Team',
    contactEmail: 'sales@github.com',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    createdById: 'user-1',
    products: [
      {
        id: '4-1',
        vendorId: '4',
        name: 'GitHub Copilot',
        description: 'AI pair programmer for code completion',
        category: ProductCategory.Coding,
        pricingModel: PricingModel.Subscription
      }
    ]
  }
];

// ========================
// Mock Assessments
// ========================

const openAIComplianceAnswers: CategoryAnswers = {
  'comp-1': { answer: 'yes', evidence: 'https://openai.com/enterprise-privacy', notes: 'US and EU data centers available' },
  'comp-2': { answer: 'yes', evidence: 'https://openai.com/enterprise-privacy#data-usage', notes: 'Enterprise plan excludes training' },
  'comp-3': { answer: 'yes', evidence: 'https://openai.com/security', notes: 'GDPR compliant, DPA available' }
};

const openAISecurityAnswers: CategoryAnswers = {
  'sec-1': { answer: 'yes', evidence: 'https://openai.com/security', notes: 'SOC 2 Type II certified' },
  'sec-2': { answer: 'yes', evidence: 'https://openai.com/enterprise', notes: 'SAML SSO and MFA supported' },
  'sec-3': { answer: 'yes', evidence: 'https://openai.com/security', notes: 'AES-256 at rest, TLS 1.2+ in transit' }
};

const openAIOperationalAnswers: CategoryAnswers = {
  'ops-1': { answer: 'yes', evidence: 'https://openai.com/policies/service-terms', notes: '99.9% uptime SLA' },
  'ops-2': { answer: 'yes', evidence: 'https://help.openai.com', notes: 'Dedicated support for enterprise' },
  'ops-3': { answer: 'yes', evidence: 'https://platform.openai.com/docs/guides/rate-limits', notes: 'Clear rate limit documentation' }
};

const openAITrustAnswers: CategoryAnswers = {
  'trust-1': { answer: 'yes', evidence: 'https://openai.com/research', notes: 'Model cards and research published' },
  'trust-2': { answer: 'yes', evidence: 'https://openai.com/charter', notes: 'OpenAI Charter published' }
};

const midjourneyComplianceAnswers: CategoryAnswers = {
  'comp-1': { answer: 'unknown', evidence: null, notes: 'Not clearly documented' },
  'comp-2': { answer: 'no', evidence: null, notes: 'User images may be used for training' },
  'comp-3': { answer: 'unknown', evidence: null, notes: 'Limited compliance documentation' }
};

const midjourneySecurityAnswers: CategoryAnswers = {
  'sec-1': { answer: 'no', evidence: null, notes: 'No certification publicly available' },
  'sec-2': { answer: 'no', evidence: null, notes: 'Discord-based authentication only' },
  'sec-3': { answer: 'unknown', evidence: null, notes: 'Not documented' }
};

const midjourneyOperationalAnswers: CategoryAnswers = {
  'ops-1': { answer: 'no', evidence: null, notes: 'No SLA available' },
  'ops-2': { answer: 'no', evidence: null, notes: 'Community support only' },
  'ops-3': { answer: 'yes', evidence: 'https://docs.midjourney.com', notes: 'Rate limits documented' }
};

const midjourneyTrustAnswers: CategoryAnswers = {
  'trust-1': { answer: 'no', evidence: null, notes: 'Training data not disclosed' },
  'trust-2': { answer: 'no', evidence: null, notes: 'No ethics policy published' }
};

export const mockAssessments: VendorAssessment[] = [
  {
    id: 'assessment-1',
    vendorId: '1',
    productId: '1-1',
    assessmentType: AssessmentType.NewVendor,
    requestedBy: 'John Smith',
    requestReason: 'Marketing team wants to use for content creation',
    department: 'Marketing',
    complianceScore: 3,
    securityScore: 3,
    operationalScore: 3,
    trustScore: 2,
    totalScore: 11,
    complianceAnswers: openAIComplianceAnswers,
    securityAnswers: openAISecurityAnswers,
    operationalAnswers: openAIOperationalAnswers,
    trustAnswers: openAITrustAnswers,
    verdict: VendorVerdict.Approved,
    verdictNotes: 'Excellent security posture and compliance documentation. Approved for enterprise use.',
    conditions: [],
    status: AssessmentStatus.Complete,
    assessedById: 'user-1',
    assessedAt: new Date('2024-01-20'),
    reviewedById: 'user-2',
    reviewedAt: new Date('2024-01-21'),
    vendorToken: null,
    vendorSubmittedAt: null,
    createdAt: new Date('2024-01-15'),
    createdById: 'user-1',
    expiresAt: new Date('2025-01-15'),
    version: 1
  },
  {
    id: 'assessment-2',
    vendorId: '3',
    productId: '3-1',
    assessmentType: AssessmentType.NewVendor,
    requestedBy: 'Sarah Johnson',
    requestReason: 'Design team exploring AI image generation tools',
    department: 'Design',
    complianceScore: 0,
    securityScore: 0,
    operationalScore: 1,
    trustScore: 0,
    totalScore: 1,
    complianceAnswers: midjourneyComplianceAnswers,
    securityAnswers: midjourneySecurityAnswers,
    operationalAnswers: midjourneyOperationalAnswers,
    trustAnswers: midjourneyTrustAnswers,
    verdict: VendorVerdict.Rejected,
    verdictNotes: 'Critical security and compliance gaps. Data may be used for training. Not recommended for enterprise use.',
    conditions: [],
    status: AssessmentStatus.Complete,
    assessedById: 'user-1',
    assessedAt: new Date('2024-03-10'),
    reviewedById: 'user-2',
    reviewedAt: new Date('2024-03-11'),
    vendorToken: null,
    vendorSubmittedAt: null,
    createdAt: new Date('2024-03-05'),
    createdById: 'user-1',
    expiresAt: null,
    version: 1
  },
  {
    id: 'assessment-3',
    vendorId: '4',
    productId: '4-1',
    assessmentType: AssessmentType.NewVendor,
    requestedBy: 'Mike Chen',
    requestReason: 'Engineering team wants AI-assisted coding',
    department: 'Engineering',
    complianceScore: 2,
    securityScore: 3,
    operationalScore: 2,
    trustScore: 1,
    totalScore: 8,
    complianceAnswers: {
      'comp-1': { answer: 'yes', evidence: 'https://github.com/features/copilot', notes: 'US and EU regions' },
      'comp-2': { answer: 'yes', evidence: 'https://github.com/features/copilot#privacy', notes: 'Business plan does not use code for training' },
      'comp-3': { answer: 'no', evidence: null, notes: 'GDPR compliance unclear' }
    },
    securityAnswers: {
      'sec-1': { answer: 'yes', evidence: 'https://github.com/security', notes: 'GitHub is SOC 2 certified' },
      'sec-2': { answer: 'yes', evidence: 'https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management', notes: 'SSO and MFA supported' },
      'sec-3': { answer: 'yes', evidence: 'https://docs.github.com/en/site-policy/privacy-policies/github-data-protection-agreement', notes: 'Encryption documented' }
    },
    operationalAnswers: {
      'ops-1': { answer: 'yes', evidence: 'https://github.com/customer-terms', notes: '99.9% uptime SLA' },
      'ops-2': { answer: 'yes', evidence: 'https://support.github.com', notes: 'Enterprise support available' },
      'ops-3': { answer: 'no', evidence: null, notes: 'Rate limits not clearly documented for Copilot' }
    },
    trustAnswers: {
      'trust-1': { answer: 'yes', evidence: 'https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/', notes: 'Training methodology published' },
      'trust-2': { answer: 'no', evidence: null, notes: 'No specific AI ethics statement' }
    },
    verdict: VendorVerdict.Conditional,
    verdictNotes: 'Good security posture. Some compliance and transparency gaps need addressing.',
    conditions: [
      'Request vendor\'s AI ethics documentation before final approval',
      'Obtain written confirmation of GDPR compliance'
    ],
    status: AssessmentStatus.Complete,
    assessedById: 'user-1',
    assessedAt: new Date('2024-02-01'),
    reviewedById: 'user-2',
    reviewedAt: new Date('2024-02-02'),
    vendorToken: null,
    vendorSubmittedAt: null,
    createdAt: new Date('2024-01-25'),
    createdById: 'user-1',
    expiresAt: new Date('2025-01-25'),
    version: 1
  },
  {
    id: 'assessment-4',
    vendorId: '2',
    productId: '2-1',
    assessmentType: AssessmentType.NewVendor,
    requestedBy: 'Lisa Wang',
    requestReason: 'Legal team evaluating AI tools for document review',
    department: 'Legal',
    complianceScore: 0,
    securityScore: 0,
    operationalScore: 0,
    trustScore: 0,
    totalScore: 0,
    complianceAnswers: {},
    securityAnswers: {},
    operationalAnswers: {},
    trustAnswers: {},
    verdict: VendorVerdict.Pending,
    verdictNotes: null,
    conditions: [],
    status: AssessmentStatus.Draft,
    assessedById: null,
    assessedAt: null,
    reviewedById: null,
    reviewedAt: null,
    vendorToken: 'abc123-token',
    vendorTokenExpiresAt: new Date('2024-04-15'),
    vendorSubmittedAt: null,
    createdAt: new Date('2024-04-01'),
    createdById: 'user-1',
    expiresAt: null,
    version: 1
  }
];

// ========================
// In-Memory Storage
// ========================

let vendors = [...mockVendors];
let assessments = [...mockAssessments];

// ========================
// Vendor Operations
// ========================

export function getVendors(): Vendor[] {
  return vendors;
}

export function getVendorById(id: string): Vendor | undefined {
  return vendors.find(v => v.id === id);
}

export function createVendor(data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
  const newVendor: Vendor = {
    ...data,
    id: `vendor-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  vendors.push(newVendor);
  return newVendor;
}

export function updateVendor(id: string, data: Partial<Vendor>): Vendor | undefined {
  const index = vendors.findIndex(v => v.id === id);
  if (index === -1) return undefined;

  vendors[index] = {
    ...vendors[index],
    ...data,
    updatedAt: new Date()
  };
  return vendors[index];
}

export function deleteVendor(id: string): boolean {
  const index = vendors.findIndex(v => v.id === id);
  if (index === -1) return false;
  vendors.splice(index, 1);
  return true;
}

// ========================
// Product Operations
// ========================

export function addProductToVendor(vendorId: string, product: Omit<VendorProduct, 'id' | 'vendorId'>): VendorProduct | undefined {
  const vendor = getVendorById(vendorId);
  if (!vendor) return undefined;

  const newProduct: VendorProduct = {
    ...product,
    id: `product-${Date.now()}`,
    vendorId
  };

  if (!vendor.products) vendor.products = [];
  vendor.products.push(newProduct);
  vendor.updatedAt = new Date();

  return newProduct;
}

// ========================
// Assessment Operations
// ========================

export function getAssessments(): VendorAssessment[] {
  return assessments;
}

export function getAssessmentById(id: string): VendorAssessment | undefined {
  return assessments.find(a => a.id === id);
}

export function getAssessmentByToken(token: string): VendorAssessment | undefined {
  return assessments.find(a => a.vendorToken === token);
}

export function getAssessmentsByVendor(vendorId: string): VendorAssessment[] {
  return assessments.filter(a => a.vendorId === vendorId);
}

export function createAssessment(data: Omit<VendorAssessment, 'id' | 'createdAt'>): VendorAssessment {
  const newAssessment: VendorAssessment = {
    ...data,
    id: `assessment-${Date.now()}`,
    createdAt: new Date()
  };
  assessments.push(newAssessment);
  return newAssessment;
}

export function updateAssessment(id: string, data: Partial<VendorAssessment>): VendorAssessment | undefined {
  const index = assessments.findIndex(a => a.id === id);
  if (index === -1) return undefined;

  assessments[index] = {
    ...assessments[index],
    ...data
  };
  return assessments[index];
}

// ========================
// Stats
// ========================

export function getVendorStats() {
  const allAssessments = getAssessments();
  const completedAssessments = allAssessments.filter(a => a.status === AssessmentStatus.Complete);

  return {
    totalVendors: vendors.length,
    approvedVendors: completedAssessments.filter(a => a.verdict === VendorVerdict.Approved).length,
    conditionalVendors: completedAssessments.filter(a => a.verdict === VendorVerdict.Conditional).length,
    pendingAssessments: allAssessments.filter(a =>
      a.status === AssessmentStatus.Draft ||
      a.status === AssessmentStatus.AwaitingVendor ||
      a.status === AssessmentStatus.InReview ||
      a.status === AssessmentStatus.AwaitingApproval
    ).length
  };
}
