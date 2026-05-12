SELECT
    i.title,
    i.content_type,
    u.pseudo
FROM items AS i
INNER JOIN users AS u ON i.user_id = u.id_user;
