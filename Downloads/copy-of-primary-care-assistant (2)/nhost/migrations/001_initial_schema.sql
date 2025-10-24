-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types for consistency
CREATE TYPE "business_type" AS ENUM ('Clinic', 'Laboratory', 'Pharmacy');
CREATE TYPE "application_status" AS ENUM ('Submitted', 'Under Review', 'Approved', 'Rejected');
CREATE TYPE "order_status" AS ENUM ('Pending Broadcast', 'Awaiting Bids', 'Bids Received', 'Assigned', 'In Progress', 'Out for Delivery', 'Ready for Pickup', 'Completed', 'Cancelled');
CREATE TYPE "quality_tier" AS ENUM ('Premium', 'Standard', 'Basic');

-- Stores applications from businesses wanting to join the marketplace
CREATE TABLE "marketplace_applications" (
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
CREATE TABLE "providers" (
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
CREATE TABLE "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_type" TEXT NOT NULL, -- 'PHARMACY' or 'LAB'
    "status" order_status NOT NULL DEFAULT 'Pending Broadcast',
    "patient_profile" JSONB NOT NULL,
    "requesting_doctor" JSONB NOT NULL,
    "prescription_details" JSONB, -- For pharmacy orders
    "tests" JSONB, -- For lab orders
    "assigned_provider_id" UUID REFERENCES providers(id),
    "service_tier_preference" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores all bids from providers for a specific order
CREATE TABLE "bids" (
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
CREATE INDEX ON "providers" ("business_type");
CREATE INDEX ON "orders" ("status");
CREATE INDEX ON "bids" ("order_id");
