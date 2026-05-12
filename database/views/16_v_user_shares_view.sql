CREATE OR REPLACE VIEW v_user_shares AS
SELECT
    s.id_share,
    i.id_item,
    i.title            AS item_title,
    u.id_user          AS owner_id,
    u.email            AS owner_email,
    s.recipient_email,
    s.access_config,
    s.created_at
FROM shares s
JOIN items i ON s.item_id = i.id_item
JOIN users u ON i.user_id = u.id_user;
