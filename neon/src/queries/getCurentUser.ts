import type { SqlClient } from "./types";

export async function getCurentUser(sql: SqlClient, uid: string) {
  return sql.query(
    `
SELECT
  u.uid,
  u.first_name,
  u.last_name,
  u.email,
  u.created_at AS user_created_at,
  u.avatar_url,
  u.phonenumber,

  selling_products.products AS newest_selling_products,
  buying_products.products AS newest_buying_products

FROM users u

LEFT JOIN LATERAL (
  SELECT json_agg(product_data ORDER BY product_data.product_created_at DESC) AS products
  FROM (
    SELECT
      p.prod_id,
      p.title,
      p.description,
      p.price,
      p.created_at AS product_created_at,
      p.is_sold,
      p.product_photo_url_1
    FROM products p
    WHERE p.seller_uid = u.uid
    ORDER BY p.created_at DESC
    LIMIT 2
  ) product_data
) selling_products ON true

LEFT JOIN LATERAL (
  SELECT json_agg(product_data ORDER BY product_data.chat_added_at DESC) AS products
  FROM (
    SELECT
      p.prod_id,
      p.title,
      p.description,
      p.price,
      p.created_at AS product_created_at,
      p.is_sold,
      p.product_photo_url_1,
      c.added_at AS chat_added_at,
      p.seller_uid
    FROM chats c
    JOIN products p
      ON p.prod_id = c.prod_id
    WHERE c.user_uid = u.uid
    ORDER BY c.added_at DESC
    LIMIT 2
  ) product_data
) buying_products ON true

WHERE u.uid = $1;
    `,
    [uid],
  );
}
