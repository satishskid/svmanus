# 🚀 Primary Care AI Assistant - Quick Nhost Setup Guide

## Step 1: Get Your Admin Secret

1. **Go to Hasura Settings**: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/settings/hasura
2. **Copy the "Admin Secret"** value
3. **Keep it handy** - you'll need it for the next step

## Step 2: Deploy Database Schema

1. **Go to Hasura Console**: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/hasura-console
2. **Click "Data" tab** at the top
3. **Click "SQL" in the left sidebar**
4. **Copy and paste this entire SQL script**:

```sql
-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types for consistency
CREATE TYPE "business_type" AS ENUM ('Clinic', 'Laboratory', 'Pharmacy');
CREATE TYPE "application_status" AS ENUM ('Submitted', 'Under Review', 'Approved', 'Rejected');
CREATE TYPE "order_status" AS ENUM ('Pending Broadcast', 'Awaiting Bids', 'Bids Received', 'Assigned', 'In Progress', 'Out for Delivery', 'Ready for Pickup', 'Completed', 'Cancelled');
CREATE TYPE "quality_tier" AS ENUM ('Premium', 'Standard', 'Basic');

-- Stores applications from businesses wanting to join the marketplace
CREATE TABLE IF NOT EXISTS "marketplace_applications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_type" business_type NOT NULL,
    "business_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "website" TEXT,
    "operational_hours_notes" TEXT,
    "communication_channel_notes" TEXT,
    "key_accreditations_notes" TEXT,
    "clinic_specialties" TEXT,
    "doctor_count" TEXT,
    "booking_system_notes" TEXT,
    "special_equipment_notes" TEXT,
    "lab_test_types" TEXT,
    "lab_certifications_notes" TEXT,
    "home_sample_collection_notes" TEXT,
    "pharmacy_services" TEXT,
    "prescription_delivery" BOOLEAN,
    "delivery_options_notes" TEXT,
    "regulatory_compliance_notes" TEXT NOT NULL,
    "attested_compliance" BOOLEAN NOT NULL DEFAULT false,
    "service_region" TEXT,
    "status" application_status NOT NULL DEFAULT 'Submitted',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores the rich profiles of approved and active providers
CREATE TABLE IF NOT EXISTS "providers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "application_id" UUID REFERENCES marketplace_applications(id),
    "name" TEXT NOT NULL,
    "business_type" business_type NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "location_details" JSONB,
    "service_regions" TEXT[],
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "website" TEXT,
    "operational_hours" TEXT,
    "communication_channels" TEXT[],
    "key_accreditations" TEXT[],
    "patient_feedback_summary" JSONB,
    "system_calculated_rating" JSONB,
    "verification_tier" TEXT,
    "onboarding_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Clinic specific
    "main_specialties" TEXT[],
    "booking_system_features" TEXT[],
    "special_equipment_or_services" TEXT[],
    "quality_tier" quality_tier,
    
    -- Lab specific
    "tests_offered_details" JSONB,
    "lab_certifications" TEXT[],
    "home_sample_collection_available" BOOLEAN,

    -- Pharmacy specific
    "services_offered" TEXT[],
    "offers_delivery" BOOLEAN,
    "delivery_options" TEXT[],

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores all orders for labs and pharmacies
CREATE TABLE IF NOT EXISTS "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_type" TEXT NOT NULL,
    "status" order_status NOT NULL DEFAULT 'Pending Broadcast',
    "patient_profile" JSONB NOT NULL,
    "requesting_doctor" JSONB NOT NULL,
    "prescription_details" JSONB,
    "tests" JSONB,
    "assigned_provider_id" UUID REFERENCES providers(id),
    "service_tier_preference" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores all bids from providers for a specific order
CREATE TABLE IF NOT EXISTS "bids" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL REFERENCES orders(id),
    "provider_id" UUID NOT NULL REFERENCES providers(id),
    "provider_name" TEXT NOT NULL,
    "bid_amount" NUMERIC(10, 2) NOT NULL,
    "estimated_delivery_time" TEXT,
    "estimated_turnaround_time" TEXT,
    "service_tier_offered" TEXT,
    "notes" TEXT,
    "quality_metrics" JSONB,
    "is_winning_bid" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS providers_business_type_idx ON "providers" ("business_type");
CREATE INDEX IF NOT EXISTS orders_status_idx ON "orders" ("status");
CREATE INDEX IF NOT EXISTS bids_order_id_idx ON "bids" ("order_id");
```

5. **Click "Run!"** to execute the SQL

## Step 3: Set Environment Variable

1. **Go to Environment Variables**: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/settings/environment-variables
2. **Click "Add Environment Variable"**
3. **Add**:
   - **Name**: `API_KEY`
   - **Value**: Your Google Gemini API key (get from https://aistudio.google.com/app/apikey)

## Step 4: Deploy Functions (One-time setup)

Since we can't use CLI, we'll deploy functions manually:

1. **Go to Functions**: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/functions

2. **Create these functions** (click "Create Function" for each):

### Function 1: `symptom-checker-initial-assessment`
- **Path**: `/symptom-checker/initial-assessment`
- **Code**: Copy from `nhost/functions/symptom-checker/initial-assessment.ts`

### Function 2: `symptom-checker-provisional-diagnosis` 
- **Path**: `/symptom-checker/provisional-diagnosis`
- **Code**: Copy from `nhost/functions/symptom-checker/provisional-diagnosis.ts`

### Function 3: `symptom-checker-suggest-tests`
- **Path**: `/symptom-checker/suggest-tests` 
- **Code**: Copy from `nhost/functions/symptom-checker/suggest-tests.ts`

### Function 4: `symptom-checker-refine-diagnosis`
- **Path**: `/symptom-checker/refine-diagnosis`
- **Code**: Copy from `nhost/functions/symptom-checker/refine-diagnosis.ts`

### Function 5: `symptom-checker-doctor-notes`
- **Path**: `/symptom-checker/doctor-notes`
- **Code**: Copy from `nhost/functions/symptom-checker/doctor-notes.ts`

### Function 6: `marketplace-submit-application`
- **Path**: `/marketplace/submit-application`
- **Code**: Copy from `nhost/functions/marketplace/submit-application.ts`

## Step 5: Test Your Application

1. **Your frontend is already running** at http://localhost:31111
2. **Try the symptom checker** - it should connect to your Nhost backend
3. **Test the marketplace onboarding** 
4. **Verify the doctor's console works**

## 🎉 That's it!

Your Primary Care AI Assistant is now fully deployed with:
- ✅ Database schema applied
- ✅ Environment variables configured  
- ✅ Serverless functions deployed
- ✅ Frontend connected to your Nhost backend

## Troubleshooting

- **Database errors**: Check the Hasura console for error messages
- **Function errors**: Check function logs in the Nhost dashboard
- **API errors**: Verify your Gemini API key is set correctly

## Next Steps

Consider:
- Setting up custom domains
- Enabling authentication for production
- Adding monitoring and logging
- Setting up CI/CD for automatic deployments
