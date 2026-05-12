CREATE OR REPLACE VIEW v_items_complete AS
SELECT
    i.id_item,
    i.user_id,
    i.title,
    i.content_type,
    i.content,
    i.thumbnail_url,
    i.created_at,

    -- Tags
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', t.id_tag,
            'name', t.tag_name
        )) FILTER (WHERE t.id_tag IS NOT NULL),
        '[]'
    ) AS tags,

    -- Shares
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', s.id_share,
            'recipientEmail', s.recipient_email,
            'settings', s.access_config
        )) FILTER (WHERE s.id_share IS NOT NULL),
        '[]'
    ) AS shares

FROM items i
LEFT JOIN item_tags it ON i.id_item = it.id_item
LEFT JOIN tags t ON it.id_tag = t.id_tag
LEFT JOIN shares s ON i.id_item = s.item_id
GROUP BY
    i.id_item,
    i.user_id,
    i.title,
    i.content_type,
    i.content,
    i.thumbnail_url,
    i.created_at;
