CREATE OR REPLACE VIEW v_user_activity_metrics AS
SELECT
    u.pseudo,
    COUNT(DISTINCT i.id_item) AS total_items,
    COUNT(DISTINCT t.id_tag) AS total_tags_created
FROM users AS u
    LEFT JOIN items AS i ON u.id_user = i.user_id
    LEFT JOIN tags AS t ON u.id_user = t.user_id
GROUP BY
    u.id_user,
    u.pseudo;
