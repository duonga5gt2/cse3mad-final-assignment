import type { SqlClient } from "./types";

export type GetTrendingProductsNext10Input = {
  lastTrendingScore: number;
  lastProdId: number;
};

export async function getTrendingProductsNext10(
  sql: SqlClient,
  input: GetTrendingProductsNext10Input
) {
  return sql.query(
    `
      WITH scored_products AS (
        SELECT
          pt.prod_id,
          SUM(pt.clicks) AS trending_score
        FROM product_trending pt
        JOIN products p
          ON pt.prod_id = p.prod_id
        WHERE pt.hour_bucket >= NOW() - INTERVAL '24 hours'
          AND p.is_sold = false
        GROUP BY pt.prod_id
      ),
      prod_and_score AS (
        SELECT
          prod_id,
          trending_score
        FROM scored_products
        WHERE
          trending_score < $1
          OR (
            trending_score = $1
            AND prod_id > $2
          )
        ORDER BY trending_score DESC, prod_id ASC
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
    `,
    [input.lastTrendingScore, input.lastProdId]
  );
}
