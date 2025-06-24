CREATE OR REPLACE FUNCTION get_user_bookings(user_id_param UUID) 
   RETURNS SETOF bookings 
   LANGUAGE sql
   SECURITY DEFINER
   AS $$
     SELECT * FROM bookings WHERE user_id = user_id_param
     ORDER BY created_at DESC;
   $$;