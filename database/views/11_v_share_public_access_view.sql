CREATE VIEW v_share_public_access AS
SELECT
  s.id_share,
  s.share_token,
  s.access_config,
  s.created_at,
  i.id_item,
  i.title AS item_title,
  i.content,
  i.content_type,
  i.thumbnail_url,
  i.source_author
FROM shares s
JOIN items i ON i.id_item = s.item_id;
