-- Service status singleton table for manual closure override
CREATE TABLE IF NOT EXISTS public.service_status (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  override_mode text NOT NULL DEFAULT 'auto' CHECK (override_mode IN ('auto', 'force_open', 'force_closed')),
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Seed the singleton row
INSERT INTO public.service_status (id, override_mode) VALUES (true, 'auto')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.service_status ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous landing visitors) can read the status
CREATE POLICY "Anyone can read service status"
ON public.service_status FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update service status"
ON public.service_status FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime so the override propagates instantly to the landing page
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_status;