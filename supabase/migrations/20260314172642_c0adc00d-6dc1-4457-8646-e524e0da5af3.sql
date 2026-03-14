
-- Add MMG to payment_method enum (must be committed separately)
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'mmg';
