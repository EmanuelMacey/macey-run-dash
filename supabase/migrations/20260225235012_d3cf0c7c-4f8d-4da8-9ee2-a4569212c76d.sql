
-- Leadership team members table
CREATE TABLE public.leadership_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active leaders" ON public.leadership_team
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leaders" ON public.leadership_team
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for leadership photos
INSERT INTO storage.buckets (id, name, public) VALUES ('leadership-photos', 'leadership-photos', true);

CREATE POLICY "Anyone can view leadership photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'leadership-photos');

CREATE POLICY "Admins can upload leadership photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'leadership-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leadership photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'leadership-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leadership photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'leadership-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed initial leadership data
INSERT INTO public.leadership_team (name, title, bio, display_order) VALUES
  ('Emanuel Macey', 'Owner & Founder', 'Emanuel Macey is the strategic visionary behind MaceyRunners, building a scalable and purpose-driven delivery brand rooted in operational excellence. He leads the company''s long-term growth strategy while maintaining a strong commitment to youth empowerment.', 1),
  ('Jahquan Hinds', 'Co-Founder & Chief Operations Officer', 'Jahquan Hinds oversees operations and service performance at MaceyRunners. He ensures efficiency, reliability, and high service standards across the company''s delivery network.', 2),
  ('Kathlyn Simpson', 'Chief Financial Officer', 'Kathlyn Simpson leads financial planning and oversight, ensuring fiscal stability and strategic resource management supporting long-term growth.', 3);

-- Trigger for updated_at
CREATE TRIGGER update_leadership_team_updated_at
  BEFORE UPDATE ON public.leadership_team
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
