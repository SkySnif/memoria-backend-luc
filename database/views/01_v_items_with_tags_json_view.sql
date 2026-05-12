CREATE OR REPLACE VIEW v_items_with_tags AS
SELECT
    i.id_item,
    i.user_id,
    i.title,
    i.content_type,
    i.thumbnail_url,
    i.created_at,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', t.id_tag,
                'name', t.tag_name
            )
        ) FILTER (WHERE t.id_tag IS NOT NULL),
        '[]'
    ) AS tags
FROM items i
LEFT JOIN item_tags it ON i.id_item = it.id_item
LEFT JOIN tags t ON it.id_tag = t.id_tag
GROUP BY
    i.id_item,
    i.user_id,
    i.title,
    i.content_type,
    i.thumbnail_url,
    i.created_at;
