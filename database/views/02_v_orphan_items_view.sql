CREATE OR REPLACE VIEW v_orphan_items AS
SELECT
    i.id_item,
    i.user_id,
    i.title,
    i.created_at,
    u.pseudo AS owner_pseudo
FROM items i
JOIN users u ON i.user_id = u.id_user
LEFT JOIN item_tags it ON i.id_item = it.id_item
WHERE it.id_item IS NULL;
