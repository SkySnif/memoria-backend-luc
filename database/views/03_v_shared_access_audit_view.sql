CREATE OR REPLACE VIEW v_shared_access_audit AS
SELECT
  s.id_share,
  s.created_at AS shared_at,

  i.id_item,
  i.title AS item_title,

  u.id_user AS owner_id,
  u.email AS owner_email,

  s.recipient_email
FROM shares s
JOIN items i ON s.item_id = i.id_item
JOIN users u ON i.user_id = u.id_user;
