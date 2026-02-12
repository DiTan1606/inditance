-- Admin RPC functions for secure operations

-- Function to ban/unban users
CREATE OR REPLACE FUNCTION admin_toggle_ban_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  caller_role TEXT;
  target_role TEXT;
  is_banned BOOLEAN;
  ban_duration TEXT;
BEGIN
  -- Check caller is admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Check target user exists and get role
  SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Prevent banning other admins
  IF target_role = 'admin' THEN
    RAISE EXCEPTION 'Cannot ban admin users';
  END IF;
  
  -- Check current ban status
  SELECT 
    COALESCE((raw_user_meta_data->>'ban_duration')::TEXT, 'none') != 'none'
  INTO is_banned
  FROM auth.users
  WHERE id = target_user_id;
  
  -- Toggle ban status
  IF is_banned THEN
    ban_duration := 'none';
  ELSE
    ban_duration := '876000h'; -- ~100 years
  END IF;
  
  -- Note: Actual ban update must be done via service role in API
  -- This function validates permissions only
  
  RETURN json_build_object(
    'success', true,
    'target_user_id', target_user_id,
    'should_ban', NOT is_banned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_toggle_ban_user TO authenticated;
