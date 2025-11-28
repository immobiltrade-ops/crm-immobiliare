export type UserRole = 'admin' | 'manager' | 'agent' | 'assistant';

export type ContactType = 'person' | 'company';
export type ContactRole = 'owner' | 'buyer' | 'tenant' | 'landlord' | 'investor' | 'partner';

export type PropertyType = 'residential' | 'commercial' | 'land' | 'industrial';
export type PropertyCategory = 'apartment' | 'villa' | 'office' | 'shop' | 'warehouse' | 'land';
export type PropertyStatus = 'available' | 'optioned' | 'sold' | 'rented' | 'withdrawn';
export type PropertyVisibility = 'public' | 'reserved' | 'mls';

export type OpportunityType = 'sale' | 'rental';
export type OpportunityStage = 'new_lead' | 'qualified' | 'visit' | 'proposal' | 'negotiation' | 'closing';
export type OpportunityStatus = 'active' | 'won' | 'lost' | 'suspended';

export type ActivityType = 'call' | 'email' | 'visit' | 'meeting' | 'task';
export type ActivityStatus = 'planned' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  active: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  type: ContactType;
  name: string;
  surname?: string;
  companyName?: string;
  fiscalCode?: string;
  vatNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  roles: ContactRole[];
  source?: string;
  referentAgent?: string;
  privacyConsent?: boolean;
  privacyConsentDate?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NeedProfile {
  id: string;
  contactId: string;
  operationType: OpportunityType;
  zones?: string[];
  propertyType?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  urgency: 1 | 2 | 3 | 4 | 5;
  budgetConfirmed: boolean;
  notes?: string;
}

export interface Property {
  id: string;
  internalCode: string;
  address: string;
  addressMasked?: string;
  city: string;
  province: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  type: PropertyType;
  category: PropertyCategory;
  cadastralData?: {
    sheet?: string;
    parcel?: string;
    sub?: string;
    category?: string;
  };
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  energyClass?: string;
  heating?: string;
  condition?: string;
  features?: string[];
  monthlyExpenses?: number;
  price: number;
  status: PropertyStatus;
  visibility: PropertyVisibility;
  exclusive: boolean;
  mandateDate?: string;
  mandateExpiry?: string;
  description?: string;
  images?: string[];
  documents?: string[];
  ownerId?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  propertyId: string;
  contactId: string;
  agentId: string;
  stage: OpportunityStage;
  status: OpportunityStatus;
  probability: number;
  expectedValue: number;
  expectedCloseDate?: string;
  notes?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  contactId?: string;
  propertyId?: string;
  opportunityId?: string;
  assignedTo: string;
  scheduledDate?: string;
  completedDate?: string;
  duration?: number;
  outcome?: string;
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalContacts: number;
  activeLeads: number;
  totalProperties: number;
  availableProperties: number;
  activeOpportunities: number;
  opportunitiesValue: number;
  thisMonthActivities: number;
  conversionRate: number;
}

export interface PipelineData {
  stage: OpportunityStage;
  count: number;
  value: number;
}
