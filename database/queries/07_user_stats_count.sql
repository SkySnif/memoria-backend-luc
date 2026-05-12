SELECT
    u.pseudo,
    COUNT(i.id_item) AS total_pepites
FROM users AS u
LEFT JOIN items AS i ON u.id_user = i.user_id
GROUP BY u.pseudo;
