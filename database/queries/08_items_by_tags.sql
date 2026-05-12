SELECT
    i.title AS pepite,
    t.tag_name AS nom_du_tag
FROM items AS i
JOIN item_tags AS it ON i.id_item = it.id_item
JOIN tags AS t ON it.id_tag = t.id_tag;
