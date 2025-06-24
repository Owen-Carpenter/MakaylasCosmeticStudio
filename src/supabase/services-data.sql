-- =====================================================
-- MAKAYLA'S COSMETIC STUDIO - SERVICES DATA
-- =====================================================
-- This script inserts all services for Makayla's Cosmetic Studio
-- Run this after the main database setup is complete
-- =====================================================

-- Insert Makayla's Cosmetic Studio services
INSERT INTO services (title, details, time, category, price) VALUES
-- LASH SERVICES
('Lash Lift & Tint', 'With a lash lift and tint, you can say goodbye to curling lashes and wearing mascara. This treatment lifts and curls your natural lashes while adding a beautiful tint for enhanced definition. Results last 4-6 weeks depending on aftercare and lifestyle.', '45 min', 'lashes', 70.00),
('Classic Eyelash Extensions', 'Individual lash extensions applied one-to-one to your natural lashes for a natural, enhanced look. Perfect for those wanting length and definition without the dramatic volume effect.', '150 min', 'lashes', 90.00),
('Angel/Wet Eyelash Extensions', 'Soft, wispy lash extensions that create a naturally glossy, wet-look effect. These extensions give you that fresh, dewy appearance with beautiful separation and texture.', '150 min', 'lashes', 105.00),
('Hybrid Eyelash Extensions', 'A perfect blend of classic and volume techniques, combining individual lashes with lightweight volume fans for natural fullness with added texture and dimension.', '150 min', 'lashes', 115.00),
('Hybrid Wispy Eyelash Extensions', 'Combining classic and volume techniques with a wispy, textured finish that creates beautiful spikes and varied lengths for an effortlessly glamorous look.', '165 min', 'lashes', 125.00),
('Volume Eyelash Extensions', 'Multiple ultra-fine lashes applied to each natural lash to create dramatic fullness and volume. Perfect for special events or those who love a bold, glamorous look.', '160 min', 'lashes', 130.00),
('Wispy Volume Eyelash Extensions', 'Maximum volume with a wispy, textured finish featuring varying lengths and spikes for the most dramatic and glamorous lash look available.', '170 min', 'lashes', 140.00),
('Lash Removal', 'Safe and professional removal of existing eyelash extensions using specialized products that protect your natural lashes during the removal process.', '20 min', 'lashes', 17.00),

-- BROW SERVICES
('Brow Lamination', 'A revolutionary treatment that straightens and lifts brow hairs to create fuller, more defined eyebrows. Perfect for taming unruly brows and creating a sleek, polished look that lasts 6-8 weeks.', '60 min', 'lashes', 75.00),
('Brow Tint & Wax', 'Professional brow shaping and tinting service that defines your natural brow shape while adding color and depth. Includes precise waxing to remove unwanted hairs and tinting for enhanced definition.', '30 min', 'lashes', 35.00),

-- FACIAL SERVICES
('Mini Dermaplane Facial', 'A gentle exfoliating treatment that removes dead skin cells and fine facial hair, revealing smoother, brighter skin. Perfect for achieving a radiant complexion and better makeup application.', '40 min', 'facials', 40.00),
('AHA Chemical Peel', 'A professional alpha hydroxy acid peel that gently removes dead skin cells, reduces fine lines, and improves skin texture and tone for a refreshed, youthful appearance.', '45 min', 'facials', 60.00),
('Procell Therapies Treatment', 'Advanced microchanneling treatment that stimulates natural collagen production to improve skin texture, reduce fine lines, and enhance overall skin appearance. Customized to your specific skin needs.', '45 min', 'facials', 350.00),

-- WAXING SERVICES
('Lip Wax', 'Quick and efficient removal of unwanted hair above the upper lip area using professional waxing techniques for smooth, hair-free results.', '10 min', 'waxing', 10.00),
('Chin Wax', 'Professional removal of unwanted chin hair using gentle waxing techniques for a clean, smooth finish that lasts weeks longer than shaving.', '20 min', 'waxing', 15.00),
('Sideburns Wax', 'Precise removal of sideburn hair to create clean, defined lines that frame your face beautifully and maintain a polished appearance.', '10 min', 'waxing', 15.00),
('Nose Wax', 'Safe and effective removal of unwanted nasal hair using specialized waxing techniques designed for sensitive areas.', '10 min', 'waxing', 10.00),
('Back Neck Wax', 'Professional removal of hair at the back of the neck for a clean, groomed appearance that''s perfect for shorter hairstyles or special occasions.', '20 min', 'waxing', 25.00),
('Underarm Wax', 'Complete removal of underarm hair using professional waxing techniques for smooth, long-lasting results without the irritation of daily shaving.', '15 min', 'waxing', 17.00),
('Half Arm Wax', 'Professional waxing of the forearm area from wrist to elbow, removing unwanted hair for smooth, silky skin that lasts for weeks.', '25 min', 'waxing', 35.00),
('Full Arm Wax', 'Complete arm waxing from shoulder to wrist, including underarms, for completely smooth and hair-free arms perfect for sleeveless outfits.', '30 min', 'waxing', 50.00),
('Half Back Wax', 'Professional waxing of either upper or lower back area to remove unwanted hair and create a smooth, clean appearance.', '35 min', 'waxing', 25.00),
('Full Back Wax', 'Complete back waxing from shoulders to lower back, removing all unwanted hair for a smooth, confident look perfect for beach or pool activities.', '40 min', 'waxing', 50.00),
('Brazilian Wax', 'Complete intimate area waxing with professional techniques ensuring comfort and hygiene. Includes all hair removal from the front, back, and everything in between.', '25 min', 'waxing', 55.00),
('Half Leg Wax', 'Professional waxing of either lower legs (knee to ankle) or upper legs (knee to bikini line) for smooth, hair-free skin that lasts for weeks.', '35 min', 'waxing', 40.00),
('Full Leg Wax', 'Complete leg waxing from ankle to bikini line, removing all unwanted hair for perfectly smooth legs that are ready for any outfit or occasion.', '50 min', 'waxing', 65.00),
('Bikini Wax', 'Professional bikini line waxing that removes hair outside the panty line for a clean, confident look perfect for swimwear and intimate apparel.', '20 min', 'waxing', 30.00)
ON CONFLICT (id) DO NOTHING;

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVICES DATA INSERTED SUCCESSFULLY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total services added: 26';
  RAISE NOTICE 'Categories: Lashes (8), Brows (2), Facials (3), Waxing (13)';
  RAISE NOTICE '==============================================';
END $$; 