/*
# Revoke EXECUTE on handle_new_user from all public roles

The REVOKE in the previous migration didn't fully remove execute access
because Supabase's API layer (pg_catalog roles) may still grant it.
Revoke from all relevant roles.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
