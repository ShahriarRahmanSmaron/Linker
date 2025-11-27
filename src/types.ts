
export interface Fabric {
  ref: string; // Backend uses 'ref' as ID
  fabrication: string;
  group_name: string; // Backend returns group_name
  style?: string;
  width?: string;
  gsm: string; // Backend returns as string
  moq?: string;
  swatchUrl: string | null; // Backend provides swatch URL
  // Legacy fields for compatibility (optional)
  id?: string;
  name?: string;
  composition?: string;
  supplier?: string;
  color?: string;
  badges?: string[];
  mockupCategories?: string[];
  type?: string;
  price?: string;
  leadTime?: string;
}

export interface ManufacturerFabric {
  id: string | number;
  fabricCode: string;
  fabricName: string;
  fabrication: string;
  fabricType: string;
  gsm: number;
  composition: string;
  category: string[];
  season: string;
  certifications: string[];
  minOrderQty: number | null;
  leadTime: number | null;
  priceRange: string | null;
  colorways: string | null;
  notes: string | null;
  swatchImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  iconName: 'Search' | 'Shirt' | 'LayoutTemplate' | 'Upload' | 'Zap' | 'Globe';
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  initials: string;
}

export interface ComparisonRow {
  feature: string;
  traditional: string;
  platform: string;
}

export interface PricingPoint {
  text: string;
}

export interface PricingTier {
  title: string;
  points: PricingPoint[];
  cta: string;
  variant: 'buyer' | 'manufacturer';
}

export interface FabricFilter {
  fabrication: string;
  type: string;
  gsmRange: string;
}
