CREATE OR REPLACE FUNCTION public.internal_edge_headers()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || COALESCE(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'INTERNAL_WEBHOOK_SECRET' LIMIT 1),
      ''
    ),
    'x-internal-secret', COALESCE(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'INTERNAL_WEBHOOK_SECRET' LIMIT 1),
      ''
    )
  )
$$;