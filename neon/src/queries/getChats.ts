import type { SqlClient } from "./types";

export async function getChats(sql: SqlClient, uid: string) {
  return sql.query(
    `
      SELECT
        c.seller_uid,
        c.user_uid,
        c.prod_id,
        c.added_at,
        p.title,
        p.price,
        p.product_photo_url_1,
        p.is_sold,
        seller.first_name AS seller_first_name,
        seller.last_name AS seller_last_name,
        seller.phonenumber AS seller_phone_number,
        buyer.first_name AS buyer_first_name,
        buyer.last_name AS buyer_last_name,
        buyer.phonenumber AS buyer_phone_number
      FROM chats c
      JOIN products p
        ON c.prod_id = p.prod_id
      JOIN users seller
        ON c.seller_uid = seller.uid
      JOIN users buyer
        ON c.user_uid = buyer.uid
      WHERE c.seller_uid = $1
         OR c.user_uid = $1
      ORDER BY c.added_at DESC;
    `,
    [uid]
  );
}
