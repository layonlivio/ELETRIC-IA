/*
# Fix handle_new_user trigger function

1. Problem
- The `handle_new_user()` SECURITY DEFINER function had no `search_path` set, causing "Database error saving new user" on signup in Supabase's hardened environment.
- The function was executable by `anon` and `authenticated` roles (security risk).

2. Changes
- Recreate `handle_new_user()` with `SET search_path = public, auth` and `SECURITY DEFINER`.
- Revoke EXECUTE from `anon` and `authenticated` (only the trigger should call it).
- Recreate the `on_auth_user_created` trigger on `auth.users`.
- Also fix `update_updated_at()` to set `search_path = public`.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, plan)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'normal')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix update_updated_at search_path too
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
