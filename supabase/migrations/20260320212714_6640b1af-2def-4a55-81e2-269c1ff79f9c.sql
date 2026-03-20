
CREATE TABLE public.driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL DEFAULT '',
  vehicle_type text NOT NULL DEFAULT 'motorcycle',
  license_plate text,
  has_license boolean NOT NULL DEFAULT false,
  availability text NOT NULL DEFAULT 'full_time',
  experience text,
  why_join text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit driver applications"
ON public.driver_applications FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage driver applications"
ON public.driver_applications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_driver_applications_updated_at
  BEFORE UPDATE ON public.driver_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
