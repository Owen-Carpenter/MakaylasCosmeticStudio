-- =====================================================
-- SERVICE VARIANTS MIGRATION (SIMPLIFIED)
-- =====================================================
-- This script adds service variant support to existing databases
-- Focuses only on table/column creation, not policies
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

-- Step 4: Enable RLS for service_variants (will not error if already enabled)
ALTER TABLE service_variants ENABLE ROW LEVEL SECURITY;

-- Step 5: Add variant columns to bookings table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'variant_id') THEN
        ALTER TABLE bookings ADD COLUMN variant_id UUID;
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

-- Step 6: Add foreign key constraint for variant_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_variant_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_variant_id_fkey 
        FOREIGN KEY (variant_id) REFERENCES service_variants(id);
        RAISE NOTICE 'Added foreign key constraint for variant_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for variant_id already exists';
    END IF;
END $$;

-- Step 7: Create index for variant_id in bookings if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bookings_variant_id ON bookings(variant_id);

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVICE VARIANTS MIGRATION COMPLETED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables updated:';
  RAISE NOTICE '- services: added has_variants column';
  RAISE NOTICE '- service_variants: created table (policies need manual setup)';
  RAISE NOTICE '- bookings: added variant_id and variant_name columns';
  RAISE NOTICE '';
  RAISE NOTICE 'MANUAL STEPS REQUIRED:';
  RAISE NOTICE '1. Set up RLS policies for service_variants table';
  RAISE NOTICE '2. Run services-data.sql to populate variant data';
  RAISE NOTICE '==============================================';
END $$; 