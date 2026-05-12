import type { SqlClient } from "./types";

export async function getProdDetail(sql: SqlClient, prodId: number) {
  return sql.query(
    `
      SELECT
        p.prod_id,
        p.seller_uid,
        p.description,
        p.title,
        p.price,
        p.pick_up_location_text,
        ST_Y(p.pick_up_location_gis) AS pick_up_latitude,
        ST_X(p.pick_up_location_gis) AS pick_up_longitude,
        p.created_at,
        p.is_sold,
        p.product_photo_url_1,
        p.product_photo_url_2,
        p.product_photo_url_3,
        u.first_name AS seller_first_name,
        u.last_name AS seller_last_name,
        u.avatar_url AS seller_avatar_url,
        u.phonenumber AS seller_phone_number
      FROM products p
      JOIN users u
        ON p.seller_uid = u.uid
      WHERE p.prod_id = $1;
    `,
    [prodId]
  );
}
