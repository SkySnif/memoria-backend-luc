SELECT
    i.title,
    COALESCE(
        JSON_AGG(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL),
        '[]'
    ) AS tags_list
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t ON it.id_tag = t.id_tag
GROUP BY i.id_item;
