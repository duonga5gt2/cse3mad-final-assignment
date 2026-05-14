import type { SqlClient } from "./types";

export type SearchForItemInput = {
  prodVector: string;
  searchText: string;
};

export async function searchForItem(sql: SqlClient, input: SearchForItemInput) {
  return sql.query(
    `
      SELECT
        p.prod_id,
        p.seller_uid,
        p.title,
        p.description,
        p.price,
        p.pick_up_location_text,
        p.product_photo_url_1,
        p.is_sold,
        p.created_at,
        u.avatar_url,
        u.first_name,
        u.last_name,
        p.prod_vector <=> $1::vector AS vector_distance
      FROM products p
      JOIN users u
        ON u.uid = p.seller_uid
      WHERE p.is_sold = false
        AND (
          p.title ILIKE '%' || $2::text || '%'
          OR p.description ILIKE '%' || $2::text || '%'
          OR p.pick_up_location_text ILIKE '%' || $2::text || '%'
          OR p.prod_vector IS NOT NULL
        )
      ORDER BY
        p.prod_vector <=> $1::vector ASC
      LIMIT 20;
    `,
    [input.prodVector, input.searchText]
  );
}
