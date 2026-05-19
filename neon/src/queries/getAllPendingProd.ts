import type { SqlClient } from "./types";

export async function getAllPendingProd(sql: SqlClient, uid: string) {
  return sql.query(
    `
      SELECT
        p.prod_id,
        p.seller_uid,
        p.title,
        p.description,
        p.price,
        p.created_at AS product_created_at,
        p.is_sold,
        p.product_photo_url_1,
        c.added_at AS chat_added_at,
        seller.first_name AS seller_first_name,
        seller.last_name AS seller_last_name,
        seller.avatar_url AS seller_avatar_url,
        seller.phonenumber AS seller_phone_number
      FROM chats c
      JOIN products p
        ON p.prod_id = c.prod_id
      JOIN users seller
        ON seller.uid = p.seller_uid
      WHERE c.user_uid = $1
      ORDER BY c.added_at DESC;
    `,
    [uid],
  );
}
