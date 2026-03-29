-- Remove duplicate triggers on notifications table
DROP TRIGGER IF EXISTS create_notification_retry_on_insert ON public.notifications;
DROP TRIGGER IF EXISTS trigger_send_push_on_notification ON public.notifications;