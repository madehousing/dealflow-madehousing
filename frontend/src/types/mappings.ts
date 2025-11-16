// Column mapping types for CSV import system

export interface ColumnMapping {
  csv_column: string;
  db_column: string;
}

export interface MappingTemplate {
  id?: number;
  template_name: string;
  description?: string;
  source_type?: string;
  state?: string;
  parcel_id_type?: string;
  column_mappings: ColumnMapping[];
  sample_headers?: string[];
  created_by?: string;
  created_at?: string;
  last_used_at?: string;
  usage_count?: number;
  is_active?: boolean;
}

export interface DatabaseField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  description: string;
  category: 'core' | 'owner' | 'contact' | 'property' | 'system';
}

// Database field definitions for mapping UI
export const DATABASE_FIELDS: DatabaseField[] = [
  // Core Property Identification
  { name: 'parcel_id', label: 'Parcel ID', type: 'string', required: false, description: 'Universal property ID (Tax Key/APN/Parcel Number)', category: 'core' },
  { name: 'original_address', label: 'Property Address (Original)', type: 'string', required: true, description: 'Full property street address', category: 'core' },
  { name: 'secondary_address', label: 'Secondary Address', type: 'string', required: false, description: 'Apt/Unit number', category: 'core' },
  { name: 'city', label: 'City', type: 'string', required: true, description: 'Property city', category: 'core' },
  { name: 'state', label: 'State', type: 'string', required: true, description: 'State code (WI, TX, FL)', category: 'core' },
  { name: 'zip_code', label: 'ZIP Code', type: 'string', required: true, description: 'Property ZIP code', category: 'core' },
  { name: 'county', label: 'County', type: 'string', required: false, description: 'Property county', category: 'core' },
  
  // Owner Information
  { name: 'owner_first_name', label: 'Owner First Name', type: 'string', required: false, description: 'Property owner first name', category: 'owner' },
  { name: 'owner_last_name', label: 'Owner Last Name', type: 'string', required: false, description: 'Property owner last name', category: 'owner' },
  { name: 'owner_mailing_address', label: 'Owner Mailing Address', type: 'string', required: false, description: 'Owner mailing address', category: 'owner' },
  { name: 'owner_secondary_address', label: 'Owner Secondary Address', type: 'string', required: false, description: 'Owner apt/unit', category: 'owner' },
  { name: 'owner_city', label: 'Owner City', type: 'string', required: false, description: 'Owner city', category: 'owner' },
  { name: 'owner_state', label: 'Owner State', type: 'string', required: false, description: 'Owner state', category: 'owner' },
  { name: 'owner_zip_code', label: 'Owner ZIP', type: 'string', required: false, description: 'Owner ZIP code', category: 'owner' },
  
  // Contact Information
  { name: 'phone_number', label: 'Primary Phone', type: 'string', required: false, description: 'Primary phone number', category: 'contact' },
  { name: 'phone_2', label: 'Phone 2', type: 'string', required: false, description: 'Secondary phone', category: 'contact' },
  { name: 'phone_3', label: 'Phone 3', type: 'string', required: false, description: 'Tertiary phone', category: 'contact' },
  { name: 'phone_4', label: 'Phone 4', type: 'string', required: false, description: 'Fourth phone', category: 'contact' },
  { name: 'phone_5', label: 'Phone 5', type: 'string', required: false, description: 'Fifth phone', category: 'contact' },
  { name: 'email', label: 'Primary Email', type: 'string', required: false, description: 'Primary email address', category: 'contact' },
  { name: 'email_2', label: 'Email 2', type: 'string', required: false, description: 'Secondary email', category: 'contact' },
  { name: 'email_3', label: 'Email 3', type: 'string', required: false, description: 'Tertiary email', category: 'contact' },
  { name: 'email_4', label: 'Email 4', type: 'string', required: false, description: 'Fourth email', category: 'contact' },
  
  // Property Details
  { name: 'property_type', label: 'Property Type', type: 'string', required: false, description: 'Single Family, Multi-Family, etc.', category: 'property' },
  { name: 'bedrooms', label: 'Bedrooms', type: 'number', required: false, description: 'Number of bedrooms', category: 'property' },
  { name: 'bathrooms', label: 'Bathrooms', type: 'number', required: false, description: 'Number of bathrooms', category: 'property' },
  { name: 'square_footage', label: 'Square Footage', type: 'number', required: false, description: 'Property square footage', category: 'property' },
  { name: 'lot_size', label: 'Lot Size', type: 'number', required: false, description: 'Lot size in acres', category: 'property' },
  { name: 'year_built', label: 'Year Built', type: 'number', required: false, description: 'Year property was built', category: 'property' },
  { name: 'estimated_value', label: 'Estimated Value', type: 'number', required: false, description: 'Estimated property value', category: 'property' },
  { name: 'last_sale_date', label: 'Last Sale Date', type: 'date', required: false, description: 'Date of last sale', category: 'property' },
  { name: 'last_sale_price', label: 'Last Sale Price', type: 'number', required: false, description: 'Last sale price', category: 'property' },
  
  // System Fields
  { name: 'group_list', label: 'Group/List', type: 'string', required: false, description: 'Group or list identifier', category: 'system' },
  { name: 'notes', label: 'Notes', type: 'string', required: false, description: 'General notes', category: 'system' },
];

// Auto-detect mapping suggestions based on column name similarity
export const detectColumnMapping = (csvColumn: string): string | null => {
  const normalized = csvColumn.toLowerCase().replace(/[_\s-]/g, '');
  
  const mappings: Record<string, string> = {
    // Parcel ID variations
    'parcelid': 'parcel_id',
    'taxkey': 'parcel_id',
    'taxkeynumber': 'parcel_id',
    'apn': 'parcel_id',
    'parcelnumber': 'parcel_id',
    'propertyid': 'parcel_id',
    
    // Address variations
    'propertyaddress': 'original_address',
    'address': 'original_address',
    'streetaddress': 'original_address',
    'situsaddress': 'original_address',
    'propaddress': 'original_address',
    'secondaryaddress': 'secondary_address',
    'unit': 'secondary_address',
    'apt': 'secondary_address',
    
    // Location
    'city': 'city',
    'state': 'state',
    'zip': 'zip_code',
    'zipcode': 'zip_code',
    'postalcode': 'zip_code',
    'county': 'county',
    
    // Owner variations
    'ownerfirstname': 'owner_first_name',
    'ownerlastname': 'owner_last_name',
    'ownermailingaddress': 'owner_mailing_address',
    'mailingaddress': 'owner_mailing_address',
    'ownercity': 'owner_city',
    'mailingcity': 'owner_city',
    'ownerstate': 'owner_state',
    'mailingstate': 'owner_state',
    'ownerzip': 'owner_zip_code',
    'mailingzip': 'owner_zip_code',
    
    // Contact variations
    'phone': 'phone_number',
    'phonenumber': 'phone_number',
    'phone1': 'phone_number',
    'primaryphone': 'phone_number',
    'phone2': 'phone_2',
    'phone3': 'phone_3',
    'phone4': 'phone_4',
    'phone5': 'phone_5',
    'email': 'email',
    'emailaddress': 'email',
    'email1': 'email',
    'primaryemail': 'email',
    'email2': 'email_2',
    'email3': 'email_3',
    'email4': 'email_4',
    
    // Property details
    'propertytype': 'property_type',
    'type': 'property_type',
    'bedrooms': 'bedrooms',
    'beds': 'bedrooms',
    'bathrooms': 'bathrooms',
    'baths': 'bathrooms',
    'squarefeet': 'square_footage',
    'sqft': 'square_footage',
    'squarefootage': 'square_footage',
    'lotsize': 'lot_size',
    'acres': 'lot_size',
    'yearbuilt': 'year_built',
    'estimatedvalue': 'estimated_value',
    'value': 'estimated_value',
    'lastsaledate': 'last_sale_date',
    'saledate': 'last_sale_date',
    'lastsaleprice': 'last_sale_price',
    'saleprice': 'last_sale_price',
    
    // System
    'notes': 'notes',
    'grouplist': 'group_list',
    'list': 'group_list',
  };
  
  return mappings[normalized] || null;
};
