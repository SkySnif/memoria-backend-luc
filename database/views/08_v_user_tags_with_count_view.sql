CREATE OR REPLACE VIEW v_user_tags_with_count AS
SELECT
  t.id_tag,
  t.tag_name,
  t.user_id,
  t.created_at,
  t.updated_at,
  COUNT(it.id_item) AS item_count
FROM tags t
LEFT JOIN item_tags it ON t.id_tag = it.id_tag
GROUP BY t.id_tag;
