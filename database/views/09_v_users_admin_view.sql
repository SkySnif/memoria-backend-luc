CREATE VIEW v_users_admin AS
SELECT
  id_user,
  email,
  pseudo,
  role_name,
  auth_provider,
  created_at,
  updated_at
FROM users;
