#!/usr/bin/env node

/**
 * Primary Care AI Assistant - Nhost Setup Script
 * Automated deployment for database schema using Nhost GraphQL API
 */

const NHOST_CONFIG = {
  subdomain: 'hwtdntpudjequljnnpth',
  region: 'ap-south-1',
  graphqlEndpoint: 'https://hwtdntpudjequljnnpth.hasura.ap-south-1.nhost.run/v1/graphql',
  adminSecret: process.env.NHOST_ADMIN_SECRET
};

async function deployDatabaseSchema() {
  console.log('🚀 Deploying database schema to Nhost...');
  
  const schema = `
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'providers_business_type_idx') THEN
        CREATE INDEX providers_business_type_idx ON "providers" ("business_type");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'orders_status_idx') THEN
        CREATE INDEX orders_status_idx ON "orders" ("status");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'bids_order_id_idx') THEN
        CREATE INDEX bids_order_id_idx ON "bids" ("order_id");
    END IF;
END $$;
`;

  console.log('📄 Schema prepared. Deploying to Hasura...');
  
  try {
    const response = await fetch('https://hwtdntpudjequljnnpth.hasura.ap-south-1.nhost.run/v2/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET || 'please-set-admin-secret'
      },
      body: JSON.stringify({
        type: 'run_sql',
        args: {
          sql: schema,
          cascade: false
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Database schema deployed successfully!');
      console.log('📊 Tables created: marketplace_applications, providers, orders, bids');
      return true;
    } else {
      console.error('❌ Failed to deploy schema. Response:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deploying schema:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Primary Care AI Assistant - Nhost Deployment');
  console.log('=================================================');
  console.log(`📍 Target: ${NHOST_CONFIG.subdomain} (${NHOST_CONFIG.region})`);
  console.log('');

  // Check for admin secret
  if (!process.env.NHOST_ADMIN_SECRET) {
    console.log('⚠️  NHOST_ADMIN_SECRET not found in environment variables');
    console.log('');
    console.log('To get your admin secret:');
    console.log('1. Go to: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/settings/hasura');
    console.log('2. Copy the "Admin Secret" value');
    console.log('3. Run: NHOST_ADMIN_SECRET="your-secret-here" node setup.mjs');
    console.log('');
    return;
  }

  // Deploy database schema
  const schemaDeployed = await deployDatabaseSchema();

  if (schemaDeployed) {
    console.log('');
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set environment variable API_KEY with your Google Gemini API key');
    console.log('2. Deploy serverless functions (see instructions below)');
    console.log('');
    console.log('🔧 Function deployment:');
    console.log('Since Nhost CLI is not available, deploy functions manually:');
    console.log('- Go to: https://app.nhost.io/orgs/wtdebeqtmcvwampdxdhi/projects/hwtdntpudjequljnnpth/functions');
    console.log('- Create each function from the nhost/functions/ directory');
    console.log('');
    console.log('✅ Your frontend is already configured and running!');
    console.log('🌐 Access it at: http://localhost:31111');
  }
}

main().catch(console.error);
