-- =====================================================
-- SERVICE VARIANTS MIGRATION
-- =====================================================
-- This script adds service variant support to existing databases
-- Run this after the main database setup is complete
-- =====================================================

-- Step 1: Add has_variants column to services table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'has_variants') THEN
        ALTER TABLE services ADD COLUMN has_variants BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added has_variants column to services table';
    ELSE
        RAISE NOTICE 'has_variants column already exists in services table';
    END IF;
END $$;

-- Step 2: Create service_variants table if it doesn't exist
CREATE TABLE IF NOT EXISTS service_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  variant_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  time VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, variant_name)
);

-- Step 3: Create indexes for service_variants if they don't exist
CREATE INDEX IF NOT EXISTS idx_service_variants_service_id ON service_variants(service_id);
CREATE INDEX IF NOT EXISTS idx_service_variants_sort_order ON service_variants(service_id, sort_order);

-- Step 4: Add RLS policies for service_variants if they don't exist
ALTER TABLE service_variants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_variants' AND policyname = 'Service variants are viewable by everyone') THEN
        CREATE POLICY "Service variants are viewable by everyone" 
          ON service_variants FOR SELECT 
          USING (true);
        RAISE NOTICE 'Created public read policy for service_variants';
    ELSE
        RAISE NOTICE 'Public read policy for service_variants already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_variants' AND policyname = 'Service variants can only be modified by admins') THEN
        CREATE POLICY "Service variants can only be modified by admins" 
          ON service_variants FOR ALL 
          USING (
            auth.uid() IN (
              SELECT id FROM users WHERE role = 'admin'
            )
          );
        RAISE NOTICE 'Created admin write policy for service_variants';
    ELSE
        RAISE NOTICE 'Admin write policy for service_variants already exists';
    END IF;
END $$;

-- Step 5: Add variant columns to bookings table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'variant_id') THEN
        ALTER TABLE bookings ADD COLUMN variant_id UUID REFERENCES service_variants(id);
        RAISE NOTICE 'Added variant_id column to bookings table';
    ELSE
        RAISE NOTICE 'variant_id column already exists in bookings table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'variant_name') THEN
        ALTER TABLE bookings ADD COLUMN variant_name VARCHAR(255);
        RAISE NOTICE 'Added variant_name column to bookings table';
    ELSE
        RAISE NOTICE 'variant_name column already exists in bookings table';
    END IF;
END $$;

-- Step 6: Create index for variant_id in bookings if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bookings_variant_id ON bookings(variant_id);

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVICE VARIANTS MIGRATION COMPLETED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables updated:';
  RAISE NOTICE '- services: added has_variants column';
  RAISE NOTICE '- service_variants: created table with RLS policies';
  RAISE NOTICE '- bookings: added variant_id and variant_name columns';
  RAISE NOTICE 'Next step: Run services-data.sql to populate variant data';
  RAISE NOTICE '==============================================';
END $$; 