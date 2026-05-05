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
  type?: ContactType;
  tipo?: string;
  firstName?: string;
  lastName?: string;
  nome?: string;
  cognome?: string;
  ragioneSociale?: string;
  companyName?: string;
  fiscalCode?: string;
  vatNumber?: string;
  phone?: string;
  telefono?: string;
  cellulare?: string;
  email?: string;
  address?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  codiceFiscale?: string;
  partitaIva?: string;
  roles?: ContactRole[];
  ruoli?: string[];
  interessi?: string[];
  budgetMin?: number;
  budgetMax?: number;
  source?: string;
  notes?: string;
  note?: string;
  tags?: string[];
  consensoPrivacy?: boolean;
  consensoMarketing?: boolean;
  privacyConsent?: boolean;
  privacyConsentDate?: string;
  properties?: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyOwner {
  id: string;
  propertyId: string;
  contactId: string;
  quota?: number;
  contact: Contact;
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
  internalCode?: string;
  titolo?: string;
  // indirizzo in entrambe le forme
  address?: string;
  addressMasked?: string;
  indirizzo?: string;
  city?: string;
  citta?: string;
  province?: string;
  provincia?: string;
  zipCode?: string;
  cap?: string;
  lat?: number;
  lng?: number;
  type?: PropertyType;
  tipo?: string;
  category?: PropertyCategory;
  stato?: string;
  status?: PropertyStatus;
  cadastralData?: {
    sheet?: string;
    parcel?: string;
    sub?: string;
    category?: string;
  };
  surface?: number;
  superficie?: number;
  rooms?: number;
  locali?: number;
  bedrooms?: number;
  bathrooms?: number;
  bagni?: number;
  floor?: number;
  piano?: string;
  totalFloors?: number;
  yearBuilt?: number;
  energyClass?: string;
  heating?: string;
  condition?: string;
  features?: string[];
  caratteristiche?: string[];
  monthlyExpenses?: number;
  price?: number;
  prezzo?: number;
  visibility?: PropertyVisibility;
  exclusive?: boolean;
  mandateDate?: string;
  mandateExpiry?: string;
  description?: string;
  descrizione?: string;
  images?: string[];
  documents?: string[];
  // proprietario singolo (legacy)
  ownerId?: string;
  owner?: Contact;
  // proprietari multipli (nuovo)
  owners?: PropertyOwner[];
  agentId?: string;
  acceptsExchange?: boolean;
  exchangeNotes?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  type?: OpportunityType;
  tipo?: string;
  stato?: string;
  titolo?: string;
  propertyId?: string;
  contactId?: string;
  agentId?: string;
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  probability?: number;
  valore?: number;
  expectedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  note?: string;
  lostReason?: string;
  contact?: Contact;
  property?: Property;
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
  contact?: Contact;
  property?: Property;
  assignee?: User;
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