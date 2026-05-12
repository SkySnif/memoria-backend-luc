CREATE OR REPLACE VIEW v_user_tags AS
SELECT
  id_tag,
  tag_name,
  user_id,
  created_at,
  updated_at
FROM tags;
