SELECT
    title,
    metadata->>'source_url' AS url
FROM items
WHERE content_type = 'video'
  AND metadata->>'source_url' NOT LIKE '%youtube%';
