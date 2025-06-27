# Service Variants System - Implementation Guide

## Overview

This implementation adds a comprehensive service variants system to Makayla's Cosmetic Studio, specifically designed for eyelash services that have different pricing based on fill periods (1-week, 2-week, 3-week fills, and full sets).

## Features

### ✅ **Database Structure**
- **Services Table**: Added `has_variants` boolean field
- **Service Variants Table**: New table storing variant options
- **Bookings Table**: Added `variant_id` and `variant_name` fields

### ✅ **Service Variants Supported**
- **Classic Eyelash Extensions**: Full Set ($90), 1-Week Fill ($40), 2-Week Fill ($50), 3-Week Fill ($60)
- **Angel/Wet Eyelash Extensions**: Full Set ($105), 1-Week Fill ($45), 2-Week Fill ($60), 3-Week Fill ($70)
- **Hybrid Eyelash Extensions**: Full Set ($115), 1-Week Fill ($45), 2-Week Fill ($60), 3-Week Fill ($70)
- **Wispy Hybrid Eyelash Extensions**: Full Set ($125), 1-Week Fill ($50), 2-Week Fill ($65), 3-Week Fill ($75)
- **Volume Lashes**: Full Set ($130), 1-Week Fill ($50), 2-Week Fill ($65), 3-Week Fill ($75)
- **Wispy Volume Eyelash Extensions**: Full Set ($140), 1-Week Fill ($50), 2-Week Fill ($65), 3-Week Fill ($80)

### ✅ **Frontend Features**
- **Service Cards**: Display base price with "from $X" for services with variants
- **Service Detail Page**: Interactive variant selection with requirements
- **Booking System**: Automatic price/duration updates based on selected variant
- **Time Slot Calculation**: Uses variant-specific duration for availability
- **Payment Integration**: Variant information included in Stripe metadata

## Database Setup

### 1. Run Migration (for existing databases)
```sql
-- Run this file to add variant support to existing databases
\i src/postgresql/add-service-variants-migration.sql
```

### 2. Populate Service Data
```sql
-- Run this file to add all services with their variants
\i src/supabase/services-data.sql
```

### 3. Verify Setup
```sql
-- Check services with variants
SELECT title, has_variants FROM services WHERE has_variants = true;

-- Check variant data
SELECT s.title, sv.variant_name, sv.price, sv.time 
FROM services s 
JOIN service_variants sv ON s.id = sv.service_id 
ORDER BY s.title, sv.sort_order;
```

## Frontend Implementation

### Service Detail Page
The service detail page (`src/app/services/[id]/ServiceDetailClient.tsx`) now includes:

1. **Variant Loading**: Automatically loads variants for services with `has_variants = true`
2. **Interactive Selection**: Click-to-select variant cards with pricing and requirements
3. **Dynamic Updates**: Price, duration, and time calculations update based on selected variant
4. **Requirements Display**: Shows lash percentage requirements for each fill option

### Booking Flow
1. User selects service from services page
2. If service has variants, user must select a variant option
3. Date and time selection uses variant-specific duration
4. Booking includes variant information in database and Stripe metadata
5. Confirmation emails show full service name with variant

## API Updates

### Booking API (`/api/bookings`)
- Accepts `variantId` and `variantName` in booking payload
- Stores variant information in database
- Includes variant data in Stripe checkout metadata

### Services API (`/lib/supabase-services.ts`)
- `getServiceVariants(serviceId)`: Fetch variants for a service
- `getServiceWithVariants(serviceId)`: Get service and its variants together
- Admin functions for creating/updating variants

## TypeScript Types

### Service Interface
```typescript
interface Service {
  id: string;
  title: string;
  details: string;
  time: string;
  price: number;
  category: string;
  has_variants?: boolean; // NEW
  created_at?: string;
  updated_at?: string;
}
```

### ServiceVariant Interface
```typescript
interface ServiceVariant {
  id: string;
  service_id: string;
  variant_name: string;
  variant_description?: string;
  price: number;
  time: string;
  sort_order: number;
  requirements?: string;
  created_at?: string;
  updated_at?: string;
}
```

## Usage Examples

### Adding a New Service with Variants

1. **Insert Service**:
```sql
INSERT INTO services (title, details, time, category, price, has_variants) 
VALUES ('New Lash Service', 'Description...', '120 min', 'lashes', 100.00, true);
```

2. **Add Variants**:
```sql
INSERT INTO service_variants (service_id, variant_name, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 100.00, '120 min', 1, 'For new clients'
FROM services s WHERE s.title = 'New Lash Service';

INSERT INTO service_variants (service_id, variant_name, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', 60.00, '90 min', 2, 'Must have 60% lashes remaining'
FROM services s WHERE s.title = 'New Lash Service';
```

### Booking with Variants
```javascript
const bookingData = {
  serviceId: 'service-uuid',
  serviceName: 'Classic Eyelash Extensions - 2 Week Fill',
  variantId: 'variant-uuid',
  variantName: '2 Week Fill',
  price: 50.00,
  duration: '90 min',
  // ... other booking data
};
```

## Benefits

1. **Flexible Pricing**: Different prices for different fill periods
2. **Clear Requirements**: Customers know lash percentage requirements
3. **Accurate Scheduling**: Time slots calculated with correct durations
4. **Better Tracking**: Detailed booking records with variant information
5. **Scalable**: Easy to add new services with variants or modify existing ones

## Testing

### Frontend Testing
1. Navigate to a lash extension service (e.g., Classic Eyelash Extensions)
2. Verify variant selection cards appear
3. Select different variants and confirm price/duration updates
4. Complete a booking and verify variant information is stored

### Database Testing
```sql
-- Check recent bookings with variants
SELECT b.service_name, b.variant_name, b.amount_paid 
FROM bookings b 
WHERE b.variant_id IS NOT NULL 
ORDER BY b.created_at DESC 
LIMIT 5;
```

## Future Enhancements

1. **Admin Interface**: Add variant management to admin dashboard
2. **Bulk Operations**: Tools for updating multiple variants at once
3. **Analytics**: Track popular variants and pricing optimization
4. **Notifications**: Variant-specific reminder templates
5. **Inventory**: Track products used per variant type

## Support

For questions or issues with the service variants system:
1. Check database constraints and foreign keys
2. Verify RLS policies are properly configured
3. Ensure frontend state management handles variant selection
4. Test booking flow end-to-end with different variants

---

**Implementation Date**: January 2025  
**Version**: 1.0  
**Status**: Production Ready ✅ 