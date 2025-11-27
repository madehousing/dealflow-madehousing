# Lead Engine OS

A comprehensive lead management system for real estate investors, built with React, TypeScript, and Supabase. The system enables bulk lead imports with intelligent duplicate detection, campaign tracking, and data quality analytics.

## Table of Contents

- [Features](#features)
- [Data Import Process](#data-import-process)
- [What You Can Do With Imported Data](#what-you-can-do-with-imported-data)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Code Review](#code-review)

---

## Features

- **Bulk Lead Import**: Upload CSV/Excel files up to 50MB with thousands of leads
- **Intelligent Duplicate Detection**: Server-side duplicate checking using Parcel ID and address matching
- **Column Mapping**: Flexible mapping of CSV columns to database fields with auto-detection
- **Mapping Templates**: Save and reuse column mapping configurations
- **Market Configuration**: Support for multiple markets with different parcel ID formats
- **Campaign Tracking**: Track imports by campaign with detailed statistics
- **Real-time Progress**: Streaming progress updates during duplicate detection
- **Data Quality Reports**: Download reports for new leads, duplicates, and invalid records

---

## Data Import Process

### Step 1: Select Market
Choose the target market/region from the dropdown. Each market has:
- State code and full name
- Parcel ID type (e.g., Tax Key Number, APN)
- Parcel ID format for validation

### Step 2: Enter Campaign Information
- **Campaign Name**: Required format `PREFIX_TYPE_YYYY-MM_VX` (e.g., `DM_Absentee_2024-11_V1`)
- **Lead Source**: Direct Mail, PPC, Cold Calling, REI Reply, PropStream, DealMachine, etc.
- **Data Provider**: The vendor who provided the lead list
- **Campaign Version**: Version identifier for tracking iterations

### Step 3: Upload File
Drag and drop or click to upload:
- Supported formats: CSV, XLSX, XLS
- Maximum file size: 50MB

### Step 4: Map Columns
The system auto-detects common column names and maps them to database fields:

**Required Fields:**
- Property Address (original_address)
- City
- State
- ZIP Code

**Optional Fields:**
- Parcel ID, County
- Owner information (name, mailing address)
- Contact info (up to 5 phones, 4 emails)
- Property details (bedrooms, bathrooms, sqft, year built, value)

You can save mapping configurations as templates for reuse.

### Step 5: Process & Review
The system:
1. Normalizes addresses (standardizes street suffixes)
2. Formats parcel IDs according to market rules
3. Checks for duplicates via Supabase Edge Function
4. Categorizes leads as: New, Duplicate, or Invalid

### Step 6: Save to Database
Review results and save new leads. The system:
- Creates a campaign record with statistics
- Batch inserts leads (100 per batch) with fallback to individual inserts on failure
- Logs all duplicates for audit purposes
- Tracks processing time and success rates

---

## What You Can Do With Imported Data

### Dashboard Analytics
- **This Week/Month/YTD Stats**: Track new leads added and duplicate rates over time
- **Total Database Size**: Monitor your lead database growth
- **Overall Duplicate Rate**: Evaluate data provider quality

### Campaign History
View all past imports with:
- Campaign name and version
- Lead source and data provider
- Total records, new leads, duplicates
- Skip trace savings (estimated at $0.75 per duplicate avoided)
- Upload timestamp

### Data Exports
Download CSV reports for:
- **New Leads**: Clean, deduplicated leads ready for skip tracing or outreach
- **Duplicates**: Records that matched existing leads (for audit/verification)
- **Invalid Leads**: Records missing required fields (for data cleanup)
- **Failed Leads**: Records that failed to save (with error reasons)

### Lead Data Structure
Each lead contains:
- **Property Info**: Address, city, state, ZIP, county, parcel ID
- **Owner Info**: Name, mailing address
- **Contact Info**: Up to 5 phone numbers, 4 email addresses
- **Property Details**: Type, beds, baths, sqft, lot size, year built, value
- **System Fields**: Status, sync status, skip trace status, campaign reference

---

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- React Router for navigation
- Tailwind CSS for styling
- shadcn/ui component library
- PapaParse for CSV parsing
- xlsx for Excel file parsing

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Supabase Edge Functions (Deno) for duplicate detection
- Row-Level Security (RLS) for data protection

---

## Getting Started

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and configure:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

---

## Code Review

### Architecture Overview

The application follows a clean component-based architecture with clear separation of concerns:

```
frontend/src/
├── components/     # Reusable UI components
├── pages/          # Route-level page components
├── hooks/          # Custom React hooks
├── integrations/   # External service clients (Supabase)
├── types/          # TypeScript type definitions
└── lib/            # Utility functions
```

### Strengths

**1. Well-Structured Component Design**
- Components are focused and single-purpose (e.g., `MarketSelector`, `ColumnMappingDialog`)
- Good use of composition with dialog components for complex workflows
- Consistent use of shadcn/ui components for UI consistency

**2. Robust Data Processing**
- Server-side duplicate detection via Edge Function prevents client-side memory issues
- Streaming SSE responses provide real-time progress feedback
- Batch processing with fallback to individual inserts ensures data integrity
- Address normalization handles common variations (Street→ST, Avenue→AVE)

**3. Type Safety**
- Comprehensive TypeScript types for mappings and database fields
- Well-defined interfaces for component props
- Type-safe Supabase client integration

**4. User Experience**
- Auto-detection of column mappings reduces manual work
- Reusable mapping templates save time on repeated imports
- Clear validation feedback with specific error messages
- Progress indicators during long operations

**5. Data Integrity**
- Required field validation before processing
- Duplicate detection on both Parcel ID and normalized address
- Audit trail via duplicate_log table
- Soft delete pattern (no hard deletes on leads)

### Areas for Improvement

**1. Error Handling**
- Some error handling could be more granular (e.g., network vs. validation errors)
- Consider adding retry logic for transient failures in batch operations
- Edge function errors could provide more actionable feedback

**2. State Management**
- `FileUpload.tsx` has significant local state that could benefit from extraction to a custom hook or context
- Consider using a state machine (XState) for the multi-step upload workflow

**3. Performance Considerations**
- Large file parsing happens on the main thread; consider Web Workers for files >10MB
- The duplicate check queries could benefit from database indexes on `(parcel_id, state)` and `(normalized_address, city, state, zip_code)`
- Pagination on the leads table would help with large datasets

**4. Testing**
- No test files present; unit tests for mapping logic and integration tests for the upload flow would improve reliability
- The `detectColumnMapping` function is a good candidate for comprehensive unit testing

**5. Code Organization**
- Some components are quite large (e.g., `FileUpload.tsx` at ~500 lines); could be split into smaller sub-components
- Consider extracting the CSV/Excel parsing logic into a dedicated utility module
- The Edge Function could benefit from separating the duplicate detection logic from the HTTP handling

**6. Security**
- Campaign name validation regex is client-side only; should be validated server-side too
- Consider rate limiting on the duplicate check endpoint
- File type validation relies on extension; consider validating file content/magic bytes

### Database Design Notes

The schema is well-designed for the use case:
- Proper use of UUIDs for primary keys
- Timestamps with timezone for audit trails
- RLS policies enforce authentication requirements
- Soft delete pattern preserves data integrity

Consider adding:
- Indexes on frequently queried columns (parcel_id, normalized_address, campaign_id)
- A composite unique constraint on `(parcel_id, state)` or `(normalized_address, city, state, zip_code)` to enforce uniqueness at the database level
- Triggers to auto-update `updated_at` timestamps (function exists but triggers not configured)

---

## License

Private - All rights reserved.
