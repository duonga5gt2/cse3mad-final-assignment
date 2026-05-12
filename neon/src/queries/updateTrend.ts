import type { SqlClient } from "./types";

export type UpdateTrendInput = {
  prodId: number;
  clicks?: number;
  clickedAt?: Date | string;
};

export async function updateTrend(sql: SqlClient, input: UpdateTrendInput) {
  return sql.query(
    `
      INSERT INTO product_trending (
        prod_id,
        clicks,
        hour_bucket
      )
      VALUES (
        $1,
        $2,
        date_trunc('hour', $3::timestamptz)
      )
      ON CONFLICT (prod_id, hour_bucket)
      DO UPDATE SET
        clicks = product_trending.clicks + EXCLUDED.clicks
      RETURNING *;
    `,
    [input.prodId, input.clicks ?? 1, input.clickedAt ?? new Date()]
  );
}
