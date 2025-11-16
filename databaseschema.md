# Database Schema Documentation

This document provides a comprehensive overview of the Supabase database schema for the Lead Management System.

## Database Functions

### update_updated_at_column()
**Type:** Trigger Function  
**Returns:** trigger  
**Language:** plpgsql  
**Security:** DEFINER  

Automatically updates the `updated_at` column to the current timestamp when a row is modified.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
```

---

## Database Triggers

Currently, there are no triggers configured in the database.

---

## Tables

### 1. campaigns

Stores campaign information for lead imports.

#### Columns

| Column Name | Data Type | Nullable | Default |
|------------|-----------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| file_name | varchar | Yes | - |
| user_id | uuid | No | - |
| upload_date | timestamptz | Yes | now() |
| total_records | integer | Yes | 0 |
| lead_source | text | Yes | - |
| data_provider | text | Yes | - |
| campaign_version | text | Yes | - |
| notes | text | Yes | - |
| status | text | Yes | 'active' |
| state | varchar | Yes | - |
| market | varchar | Yes | - |
| campaign_type | varchar | Yes | - |
| uploaded_by | varchar | Yes | - |
| campaign_name | text | No | - |
| duplicates_found | integer | Yes | 0 |
| new_leads_count | integer | Yes | 0 |
| skip_trace_needed | integer | Yes | 0 |
| skip_trace_savings | numeric | Yes | 0 |
| total_called | integer | Yes | 0 |
| total_contacted | integer | Yes | 0 |
| total_interested | integer | Yes | 0 |
| total_deals | integer | Yes | 0 |
| roi_score | numeric | Yes | 0 |
| cost_per_lead | numeric | Yes | 0 |
| cost_per_deal | numeric | Yes | 0 |
| file_size_kb | integer | Yes | - |
| duplicate_rate | numeric | Yes | - |
| created_at | timestamptz | Yes | now() |
| updated_at | timestamptz | Yes | now() |
| processing_time_seconds | integer | Yes | - |

#### Row-Level Security Policies

- **Authenticated users can view all campaigns** (SELECT): `true`
- **Authenticated users can insert campaigns** (INSERT): `auth.uid() = user_id`
- **Authenticated users can update all campaigns** (UPDATE): `true`

#### Restrictions
- Users cannot DELETE campaigns

---

### 2. column_mapping_templates

Stores reusable column mapping configurations for CSV imports.

#### Columns

| Column Name | Data Type | Nullable | Default |
|------------|-----------|----------|---------|
| id | integer | No | nextval('column_mapping_templates_id_seq') |
| column_mappings | jsonb | No | - |
| template_name | varchar | No | - |
| state | varchar | Yes | - |
| created_by | varchar | Yes | - |
| description | text | Yes | - |
| source_type | varchar | Yes | - |
| parcel_id_type | varchar | Yes | - |
| created_at | timestamptz | Yes | now() |
| last_used_at | timestamptz | Yes | - |
| usage_count | integer | Yes | 0 |
| is_active | boolean | Yes | true |
| sample_headers | jsonb | Yes | - |

#### Row-Level Security Policies

- **Users can view all templates** (SELECT): `auth.role() = 'authenticated'`
- **Users can create templates** (INSERT): `auth.role() = 'authenticated'`
- **Users can update templates** (UPDATE): `auth.role() = 'authenticated'`
- **Users can delete templates** (DELETE): `auth.role() = 'authenticated'`

---

### 3. duplicate_log

Tracks duplicate leads detected during import processing.

#### Columns

| Column Name | Data Type | Nullable | Default |
|------------|-----------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| lead_id | uuid | Yes | - |
| original_lead_id | uuid | Yes | - |
| campaign_id | uuid | Yes | - |
| detected_at | timestamptz | Yes | now() |
| match_confidence | numeric | Yes | - |
| original_upload_date | timestamptz | Yes | - |
| original_status | varchar | Yes | - |
| match_type | text | Yes | - |
| matched_on | varchar | Yes | - |
| duplicate_parcel_id | varchar | Yes | - |
| duplicate_address | text | Yes | - |
| duplicate_owner_name | varchar | Yes | - |
| duplicate_state | varchar | Yes | - |
| duplicate_market | varchar | Yes | - |
| original_campaign_name | varchar | Yes | - |

#### Row-Level Security Policies

- **Authenticated users can view all duplicate logs** (SELECT): `true`
- **Authenticated users can insert duplicate logs** (INSERT): `true`

#### Restrictions
- Users cannot UPDATE duplicate logs
- Users cannot DELETE duplicate logs

---

### 4. leads

Stores all lead information including contact details and property data.

#### Columns

| Column Name | Data Type | Nullable | Default |
|------------|-----------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| campaign_id | uuid | No | - |
| ghl_contact_id | varchar | Yes | - |
| original_address | text | No | - |
| normalized_address | text | No | - |
| city | text | No | - |
| state | text | No | - |
| zip_code | text | No | - |
| secondary_address | text | Yes | - |
| parcel_id | text | Yes | - |
| parcel_id_type | varchar | Yes | - |
| state_full | varchar | Yes | - |
| county | varchar | Yes | - |
| market | varchar | Yes | - |
| owner_first_name | text | Yes | - |
| owner_last_name | text | Yes | - |
| owner_full_name | text | Yes | - |
| owner_mailing_address | text | Yes | - |
| owner_secondary_address | text | Yes | - |
| owner_city | varchar | Yes | - |
| owner_state | varchar | Yes | - |
| owner_zip_code | varchar | Yes | - |
| phone_number | varchar | Yes | - |
| phone_2 | text | Yes | - |
| phone_3 | text | Yes | - |
| phone_4 | text | Yes | - |
| phone_5 | text | Yes | - |
| email | varchar | Yes | - |
| email_2 | text | Yes | - |
| email_3 | text | Yes | - |
| email_4 | text | Yes | - |
| last_contact_method | varchar | Yes | - |
| last_contact_date | timestamptz | Yes | - |
| next_follow_up_date | timestamptz | Yes | - |
| contact_attempts | integer | Yes | 0 |
| notes | text | Yes | - |
| skip_trace_status | varchar | Yes | 'Not Started' |
| skip_trace_provider | varchar | Yes | - |
| skip_trace_date | timestamptz | Yes | - |
| podio_item_id | varchar | Yes | - |
| calltools_lead_id | varchar | Yes | - |
| ghl_contact_id | varchar | Yes | - |
| external_id_1 | varchar | Yes | - |
| external_id_2 | varchar | Yes | - |
| interested_in_selling | boolean | Yes | - |
| estimated_value | numeric | Yes | - |
| last_sale_price | numeric | Yes | - |
| last_sale_date | date | Yes | - |
| property_type | varchar | Yes | - |
| lot_size | numeric | Yes | - |
| bedrooms | integer | Yes | - |
| bathrooms | numeric | Yes | - |
| square_footage | integer | Yes | - |
| year_built | integer | Yes | - |
| data_source | varchar | Yes | - |
| data_provider | varchar | Yes | - |
| list_name | varchar | Yes | - |
| group_list | text | Yes | - |
| created_by | varchar | Yes | - |
| status | text | Yes | 'new' |
| disposition | varchar | Yes | - |
| assigned_to | varchar | Yes | - |
| sync_status | varchar | Yes | 'Not Synced' |
| is_deleted | boolean | Yes | false |
| last_synced_at | timestamptz | Yes | - |
| created_at | timestamptz | Yes | now() |
| updated_at | timestamptz | Yes | now() |

#### Row-Level Security Policies

- **Authenticated users can view all leads** (SELECT): `true`
- **Authenticated users can insert leads** (INSERT): `true`
- **Authenticated users can update all leads** (UPDATE): `true`

#### Restrictions
- Users cannot DELETE leads

---

### 5. markets

Defines market configurations including state and parcel ID types.

#### Columns

| Column Name | Data Type | Nullable | Default |
|------------|-----------|----------|---------|
| id | integer | No | nextval('markets_id_seq') |
| market_code | varchar | No | - |
| market_name | varchar | No | - |
| state | varchar | No | - |
| state_full | varchar | No | - |
| parcel_id_type | varchar | No | - |
| parcel_id_format | varchar | Yes | - |
| counties | text[] | Yes | - |
| cities | text[] | Yes | - |
| is_active | boolean | Yes | true |
| created_at | timestamptz | Yes | now() |
| updated_at | timestamptz | Yes | now() |

#### Row-Level Security Policies

- **Markets are viewable by authenticated users** (SELECT): `auth.role() = 'authenticated'`

#### Restrictions
- Users cannot INSERT markets
- Users cannot UPDATE markets
- Users cannot DELETE markets

---

## Edge Functions

### check-duplicates

**Location:** `supabase/functions/check-duplicates/index.ts`

Processes uploaded lead files to detect duplicates against the existing database. Returns real-time progress updates via Server-Sent Events (SSE).

**Request:**
- Method: POST
- Body: JSON with leads data, campaign info, and mapping configuration

**Response:**
- Streaming SSE with progress updates
- Final result includes duplicate matches and statistics

---

## Notes

- All timestamps use `timestamptz` (timestamp with time zone)
- UUIDs are generated using `gen_random_uuid()`
- Row-Level Security (RLS) is enabled on all tables
- Most tables use soft delete patterns (no DELETE policies)
- The `update_updated_at_column()` function can be used with triggers to auto-update timestamps
