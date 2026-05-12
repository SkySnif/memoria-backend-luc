SELECT
    ae.message,
    u.email
FROM app_events AS ae
LEFT JOIN users AS u ON ae.user_id = u.id_user;
