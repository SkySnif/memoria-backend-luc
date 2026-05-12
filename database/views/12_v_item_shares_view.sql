CREATE VIEW v_item_shares AS
SELECT
  s.id_share,
  s.item_id,
  s.recipient_email,
  s.share_token,
  s.access_config,
  s.created_at,
  s.updated_at
FROM shares s;
