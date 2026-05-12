import type { SqlClient } from "./types";

export type SearchForItemInput = {
  prodVector: string;
  searchText: string;
};

export async function searchForItem(sql: SqlClient, input: SearchForItemInput) {
  return sql.query(
    `
      SELECT
        prod_id,
        seller_uid,
        title,
        description,
        price,
        pick_up_location_text,
        product_photo_url_1,
        is_sold,
        created_at,
        prod_vector <=> $1::vector AS vector_distance
      FROM products
      WHERE is_sold = false
        AND (
          title ILIKE '%' || $2 || '%'
          OR description ILIKE '%' || $2 || '%'
          OR pick_up_location_text ILIKE '%' || $2 || '%'
          OR prod_vector IS NOT NULL
        )
      ORDER BY
        prod_vector <=> $1::vector ASC
      LIMIT 20;
    `,
    [input.prodVector, input.searchText]
  );
}
