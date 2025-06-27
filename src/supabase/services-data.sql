-- =====================================================
-- MAKAYLA'S COSMETIC STUDIO - SERVICES DATA
-- =====================================================
-- This script inserts all services for Makayla's Cosmetic Studio
-- Run this after the main database setup is complete
-- =====================================================

-- Insert Makayla's Cosmetic Studio services
INSERT INTO services (title, details, time, category, price, has_variants) VALUES
-- LASH SERVICES (with variants)
('Classic Eyelash Extensions', 'One eyelash extension per natural lash. This set is to enhance length and/or thickness to natural lashes. Recommended upkeep: you need to come get a fill at least every two weeks for the health of your natural lashes (I need to remove outgrown extensions and replace them with new ones).', '150 min', 'lashes', 90.00, true),
('Angel/Wet Eyelash Extensions', 'A ''step up'' from classic eyelash extensions. Each of these sets use the lightest of the lightest lashes to create small closed fans, using different techniques for each different set. Recommended upkeep: you need to come get a fill at least every two weeks for the health of your natural lashes.', '150 min', 'lashes', 105.00, true),
('Hybrid Eyelash Extensions', 'Mix of classic and volume lashes. Depending on your natural lash health and lash length, I can create a more "natural" set; or can make fuller set for a more voluminous look. Recommended upkeep: you need to book a fill at least every two weeks for the health of your natural lashes.', '150 min', 'lashes', 115.00, true),
('Wispy Hybrid Eyelash Extensions', 'A hybrid set with added "spikes" to give a wispy appearance. Recommended upkeep: you need to book a fill at least every two weeks for the health of your natural lashes.', '160 min', 'lashes', 125.00, true),
('Volume Lashes', 'Three or more lashes (depending on clients wants & natural lash health/length) bouquet and applied to one natural lash. This is the fullest/most dramatic lash extension set I offer. Recommended upkeep: you need to book a fill at least every two weeks for the health of your natural lashes.', '160 min', 'lashes', 130.00, true),
('Wispy Volume Eyelash Extensions', 'A volume set with added "spikes" to give a wispy appearance. This is the most fullest/dramatic lash extension set I offer with added wispiness. Recommended upkeep: you need to book a fill at least every two weeks for the health of your natural lashes.', '165 min', 'lashes', 140.00, true),

-- LASH SERVICES (without variants)
('Lash Lift', 'Mimics the effect of an eyelash curler. A lash lift will make your lashes curl upwards and look longer; as the eyes will appear more open and bright. This treatment lasts 4-6 weeks depending on aftercare and lifestyle.', '45 min', 'lashes', 60.00, false),
('Lash Tint', 'A lash tint will make your lashes look darker, thicker, and fuller like you have mascara on.', '30 min', 'lashes', 25.00, false),
('Lash Lift & Tint', 'With a lash lift and tint, you can say goodbye to curling lashes and wearing mascara. This treatment lasts 4-6 weeks depending on aftercare and lifestyle.', '60 min', 'lashes', 70.00, false),
('Lash Removal', 'Removal of eyelash extensions (free when booked with a full set).', '20 min', 'lashes', 17.00, false),
('ADD ON: Lash Decals', 'Add lash decals to any lash set/fill (contact me for available decals). $5 per set of decals.', '10 min', 'lashes', 5.00, false),
('ADD ON: Pop Of Color', 'Add a ''pop of color'' to any lash set/fill (contact me for available colors).', '15 min', 'lashes', 10.00, false),

-- BROW SERVICES
('Brow Wax (no shaping)', 'A quick brow clean up (does not include shaping). Last 2-4 weeks.', '15 min', 'lashes', 10.00, false),
('Brow Wax (with shaping)', 'A brow wax that includes mapping and shaping of the brows. Last 2-4 weeks.', '25 min', 'lashes', 17.00, false),
('Brow Tint', 'Tinting of the brows.', '30 min', 'lashes', 30.00, false),
('Brow Tint & Wax (with shaping)', 'Tinting and waxing of the brows that comes with mapping/shaping leaving you with the best eyebrow shape for you.', '45 min', 'lashes', 37.00, false),
('Brow Lamination', 'Process of "perming" your brow hairs, but instead of curls, you get straighter, slightly upward or feathered (depending on your wants) that are set in place. Brow laminations comes with the whole package: lamination, tint, and wax (with shaping).', '60 min', 'lashes', 75.00, false),

-- FACIAL SERVICES
('Mini Dermaplane Facial', 'Dermaplaning is a service removing the uppermost layers of the face while also taking off all the peach fuzz. Dermaplaning can help reduce the appearance of acne scars & other skin imperfections by revealing newer, undamaged skin. Recommended: every 4-6 weeks.', '40 min', 'facials', 40.00, false),
('AHA (Light) Chemical Peel', 'Very effective exfoliants that penetrate several layers deep into the epidermis. AHA dissolves the "glue" connections between skin cells, lifts dead surface cells off, and releases Collagen and Elastin Peptides throughout the underlying Dermis. Can improve many different skin imperfections.', '45 min', 'facials', 60.00, false),
('Dermaplane & AHA Chemical Peel', 'A combination of dermaplaning and chemical peel in one session. This makes the chemical peel be able to penetrate deeper and be better absorbed for an overall smoother application.', '70 min', 'facials', 85.00, false),
('Procell Therapies Treatment', 'This is a complete skin transformation. I will be using a unique micro channelling device to gently stimulate the skin triggering the body''s natural healing response. A minimum series of 3 is recommended for face & body; and a minimum of 5 for the hair. (Can do more) Comes with an aftercare kit.', '45 min', 'facials', 350.00, true),

-- WAXING SERVICES
('Lip Wax', 'Hair removal of the lip. Last 2-3 weeks.', '10 min', 'waxing', 10.00, false),
('Chin Wax', 'Hair removal of the chin. Last 2-3 weeks.', '20 min', 'waxing', 15.00, false),
('Sideburn Wax', 'Hair removal of both sideburns. Last 2-3 weeks.', '10 min', 'waxing', 15.00, false),
('Nose Wax', 'Hair removal of the inside of the lower nostrils. Last 2-4 weeks.', '10 min', 'waxing', 10.00, false),
('Back Of Neck Wax', 'Hair removal of back of neck. Last 3-4 weeks.', '20 min', 'waxing', 25.00, false),
('Underarm Wax', 'Hair removal of both underarms. Last 2-4 weeks.', '15 min', 'waxing', 17.00, false),
('1/2 Arm Wax', 'Hair removal of 1/2 the arms. Last 3-4 weeks.', '25 min', 'waxing', 35.00, false),
('Full Arm Wax', 'Full hair removal of both arms. Last 3-4 weeks.', '30 min', 'waxing', 50.00, false),
('1/2 Back Wax', 'Hair removal of 1/2 the back. Last 3-4 weeks.', '35 min', 'waxing', 25.00, false),
('Full Back Wax', 'Hair removal of the full back. Last 3-4 weeks.', '40 min', 'waxing', 50.00, false),
('Bikini Wax', 'Hair removal of the bikini line, basically anything that would be showing whenever you wear a swimsuit. Last 3-4 weeks.', '20 min', 'waxing', 30.00, false),
('Brazilian Wax', 'Hair removal of absolutely everything down there. Last 4 weeks.', '25 min', 'waxing', 55.00, false),
('1/2 Leg Wax', 'Hair removal of 1/2 the legs. Last 4-5 weeks.', '35 min', 'waxing', 40.00, false),
('Full Leg Wax', 'Full hair removal of the legs. Last 4-5 weeks.', '60 min', 'waxing', 60.00, false)
ON CONFLICT (id) DO NOTHING;

-- Insert service variants for eyelash extension services
-- We need to get the service IDs first, then insert variants

-- Classic Eyelash Extensions variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of classic eyelash extensions', 90.00, '150 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Classic Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '25% fill for classic lashes', 40.00, '50 min', 2, 'Must have 75% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Classic Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '40% fill for classic lashes', 50.00, '90 min', 3, 'Must have at least 60% of lashes left.'
FROM services s WHERE s.title = 'Classic Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for classic lashes', 60.00, '115 min', 4, 'Must have at least 40% of lashes left.'
FROM services s WHERE s.title = 'Classic Eyelash Extensions';

-- Angel/Wet Eyelash Extensions variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of angel/wet eyelash extensions', 105.00, '150 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Angel/Wet Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '25% fill for angel/wet lashes', 45.00, '55 min', 2, 'Must have 75% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Angel/Wet Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '40% fill for angel/wet lashes', 60.00, '90 min', 3, 'Must have 60% or more of lashes left. If you have more than 60% missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Angel/Wet Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for angel/wet lashes', 70.00, '120 min', 4, 'Must have at least 40% of lashes left.'
FROM services s WHERE s.title = 'Angel/Wet Eyelash Extensions';

-- Hybrid Eyelash Extensions variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of hybrid eyelash extensions', 115.00, '150 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '20% fill for hybrid lashes', 45.00, '55 min', 2, 'Must have 80% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '50% fill for hybrid lashes', 60.00, '90 min', 3, 'Must have 50% or more of lashes left. If you have 60% or more missing it would be considered a full set, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for hybrid lashes', 70.00, '120 min', 4, 'Must have at least 40% of lash extensions left.'
FROM services s WHERE s.title = 'Hybrid Eyelash Extensions';

-- Wispy Hybrid Eyelash Extensions variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of wispy hybrid eyelash extensions', 125.00, '160 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Wispy Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '25% fill for wispy hybrid lashes', 50.00, '60 min', 2, 'Must have 75% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Wispy Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '40% fill for wispy hybrid lashes', 65.00, '90 min', 3, 'Must have 60% or more of lashes left. If you have 50% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Wispy Hybrid Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for wispy hybrid lashes', 75.00, '120 min', 4, 'Must have at least 40% of lash extensions left.'
FROM services s WHERE s.title = 'Wispy Hybrid Eyelash Extensions';

-- Volume Lashes variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of volume lashes', 130.00, '160 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Volume Lashes';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '20% fill for volume lashes', 50.00, '65 min', 2, 'Must have 80% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Volume Lashes';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '40% fill for volume lashes', 65.00, '90 min', 3, 'Must have 60% or more of lashes left. If you have 50% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Volume Lashes';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for volume lashes', 75.00, '120 min', 4, 'Must have at least 40% of lashes left.'
FROM services s WHERE s.title = 'Volume Lashes';

-- Wispy Volume Eyelash Extensions variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Full Set', 'Complete new set of wispy volume eyelash extensions', 140.00, '165 min', 1, 'For new clients or when less than 40% lashes remain'
FROM services s WHERE s.title = 'Wispy Volume Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '1 Week Fill', '20% fill for wispy volume lashes', 50.00, '60 min', 2, 'Must have 80% or more of lashes left. If you have 30% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Wispy Volume Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '2 Week Fill', '50% fill for wispy volume lashes', 65.00, '110 min', 3, 'Must have 50% or more of lashes left. If you have 60% or more missing, you will be charged accordingly or possibly rescheduled.'
FROM services s WHERE s.title = 'Wispy Volume Eyelash Extensions';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Week Fill', '60% fill for wispy volume lashes', 80.00, '120 min', 4, 'Must have at least 40% of your lash extensions left.'
FROM services s WHERE s.title = 'Wispy Volume Eyelash Extensions';

-- Procell Therapies Treatment variants
INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Procell Therapy (By Itself)', 'Complete skin transformation using micro channelling device. Comes with aftercare kit.', 350.00, '45 min', 1, 'Minimum series of 3 recommended for face & body; minimum of 5 for hair'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Procell Therapy With Dermaplaning', 'Procell therapy combined with dermaplaning for enhanced results. $50 deposit required.', 370.00, '75 min', 2, '$50.00 deposit required. Minimum series of 3 recommended for face & body'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Procell Therapy With Peel', 'Procell therapy combined with AHA chemical peel. $50 deposit required.', 380.00, '90 min', 3, '$50.00 deposit required. Minimum series of 3 recommended for face & body'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, 'Procell With Dermaplaning & Peel', 'Complete treatment combining Procell therapy, dermaplaning, and chemical peel. $50 deposit required.', 400.00, '100 min', 4, '$50.00 deposit required. Most comprehensive skin transformation treatment'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '3 Procell Therapies', 'Package of 3 Procell therapy sessions for optimal results. $100 deposit required.', 899.00, '45 min', 5, '$100.00 deposit required. Recommended minimum series for face & body'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

INSERT INTO service_variants (service_id, variant_name, variant_description, price, time, sort_order, requirements)
SELECT s.id, '5 Procell Therapies', 'Package of 5 Procell therapy sessions for hair treatments. $100 deposit required.', 1399.00, '45 min', 6, '$100.00 deposit required. Recommended minimum series for hair treatments'
FROM services s WHERE s.title = 'Procell Therapies Treatment';

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVICES DATA INSERTED SUCCESSFULLY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total services added: 32';
  RAISE NOTICE 'Lash services with variants: 6';
  RAISE NOTICE 'Facial services with variants: 1 (Procell Therapies)';
  RAISE NOTICE 'Service variants added: 30 (24 lash + 6 Procell)';
  RAISE NOTICE 'Categories: Lashes (12), Brows (5), Facials (4), Waxing (13)';
  RAISE NOTICE '==============================================';
END $$; 