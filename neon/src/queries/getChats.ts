import type { SqlClient } from "./types";

const CHAT_SELECT = `
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
`;

export async function getBuyingChats(sql: SqlClient, uid: string) {
  return sql.query(
    `
      ${CHAT_SELECT}
      WHERE c.user_uid = $1::text
        AND c.seller_uid <> $1::text
      ORDER BY c.added_at DESC;
    `,
    [uid]
  );
}

export async function getSellingChats(sql: SqlClient, uid: string) {
  return sql.query(
    `
      ${CHAT_SELECT}
      WHERE c.seller_uid = $1::text
        AND c.user_uid <> $1::text
      ORDER BY c.added_at DESC;
    `,
    [uid]
  );
}
