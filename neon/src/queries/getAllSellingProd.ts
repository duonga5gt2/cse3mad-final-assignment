import type { SqlClient } from "./types";

export async function getAllSellingProd(sql: SqlClient, uid: string) {
  return sql.query(
    `
      SELECT
        p.prod_id,
        p.title,
        p.description,
        p.price,
        p.created_at AS product_created_at,
        p.is_sold,
        p.product_photo_url_1,
        seller.first_name AS seller_first_name,
        seller.last_name AS seller_last_name,
        seller.avatar_url AS seller_avatar_url
      FROM products p
      JOIN users seller
        ON seller.uid = p.seller_uid
      WHERE p.seller_uid = $1
      ORDER BY p.created_at DESC;
    `,
    [uid],
  );
}
