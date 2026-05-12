SELECT
    title,
    content_type
FROM items
WHERE LENGTH(content) > 20;
