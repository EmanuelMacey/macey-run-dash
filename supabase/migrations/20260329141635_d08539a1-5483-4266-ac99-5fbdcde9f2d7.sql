-- Remove duplicate triggers on orders table (keep trg_ prefixed versions)
DROP TRIGGER IF EXISTS auto_generate_invoice_on_delivery ON public.orders;
DROP TRIGGER IF EXISTS credit_referrer_trigger ON public.orders;
DROP TRIGGER IF EXISTS notify_drivers_on_new_order ON public.orders;
DROP TRIGGER IF EXISTS on_driver_assignment ON public.orders;
DROP TRIGGER IF EXISTS on_order_delivered_award_points ON public.orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS trg_order_status_notification ON public.orders;
DROP TRIGGER IF EXISTS trg_send_email_on_order_insert ON public.orders;
DROP TRIGGER IF EXISTS trg_send_email_on_order_update ON public.orders;