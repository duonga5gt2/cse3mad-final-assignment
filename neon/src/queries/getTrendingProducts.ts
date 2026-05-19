import type { SqlClient } from "./types";

export async function getTrendingProducts(sql: SqlClient) {
  return sql.query(
    `
      WITH prod_and_score AS (
        SELECT
          p.prod_id,
          COALESCE(
            SUM(pt.clicks) FILTER (
              WHERE pt.hour_bucket >= NOW() - INTERVAL '24 hours'
            ),
            0
          ) AS trending_score
        FROM products p
        LEFT JOIN product_trending pt
          ON pt.prod_id = p.prod_id
        WHERE p.is_sold = false
        GROUP BY p.prod_id
        ORDER BY trending_score DESC, p.prod_id ASC
        LIMIT 10
      )
      SELECT
        pas.prod_id,
        pas.trending_score,
        p.seller_uid,
        p.price,
        p.title,
        p.product_photo_url_1,
        u.avatar_url,
        u.first_name,
        u.last_name
      FROM prod_and_score pas
      JOIN products p
        ON pas.prod_id = p.prod_id
      JOIN users u
        ON u.uid = p.seller_uid
      ORDER BY pas.trending_score DESC, pas.prod_id ASC;
    `
  );
}
