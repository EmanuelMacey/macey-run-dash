
-- Delete old vault secret and create new one with known value
DELETE FROM vault.secrets WHERE name = 'INTERNAL_WEBHOOK_SECRET';
SELECT vault.create_secret('maceyrunners_internal_webhook_2026_secure_key_x9k2m', 'INTERNAL_WEBHOOK_SECRET');
