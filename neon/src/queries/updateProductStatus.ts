import type { SqlClient } from "./types";

export type UpdateProductStatusInput = {
  prodId: number;
  sellerUid: string;
  isSold: boolean;
};

export async function updateProductStatus(
  sql: SqlClient,
  input: UpdateProductStatusInput
) {
  return sql.query(
    `
      UPDATE products
      SET is_sold = $1
      WHERE prod_id = $2
        AND seller_uid = $3
      RETURNING *;
    `,
    [input.isSold, input.prodId, input.sellerUid]
  );
}
