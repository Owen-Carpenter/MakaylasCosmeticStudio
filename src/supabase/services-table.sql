-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
);

-- Create the services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  time VARCHAR(50) NOT NULL, -- e.g. "60 min", "2 hours"
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Add RLS (Row Level Security) policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to services
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT 
  USING (true);

-- Policy for admin-only write access
CREATE POLICY "Services can only be modified by admins" 
  ON services FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Sample data insertion (uncomment to use)
/*
INSERT INTO services (title, details, time, category, price) VALUES
('Business Consultation', 'One-on-one consultation for your business needs. Our expert consultants will help you identify opportunities for growth, optimize operations, and develop strategic plans tailored to your business goals.', '60 min', 'consulting', 99.00),
('Haircut & Styling', 'Professional haircut and styling service. Our experienced stylists will provide a personalized experience, from consultation to finishing touches, ensuring you leave with a look that suits your style and personality.', '45 min', 'beauty', 49.00),
('Home Repair', 'General home repair and maintenance. Our skilled technicians can handle a wide range of repairs, from fixing leaky faucets to patching drywall, helping you maintain your home in top condition.', '120 min', 'maintenance', 129.00),
('Legal Consultation', 'Professional legal advice for various matters. Our attorneys provide clear guidance on legal issues affecting individuals and businesses, helping you navigate complex legal situations with confidence.', '90 min', 'consulting', 149.00),
('Massage Therapy', 'Relaxing full-body massage to relieve stress. Our certified massage therapists use various techniques to reduce muscle tension, improve circulation, and promote overall well-being.', '60 min', 'beauty', 79.00);
*/ 