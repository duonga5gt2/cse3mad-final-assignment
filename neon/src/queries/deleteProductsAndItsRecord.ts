import type { SqlClient } from "./types";

export type DeleteProductsAndItsRecordInput = {
  prodId: number;
  sellerUid: string;
};

export async function deleteProductsAndItsRecord(
  sql: SqlClient,
  input: DeleteProductsAndItsRecordInput
) {
  await sql.query("DELETE FROM chats WHERE prod_id = $1;", [input.prodId]);
  await sql.query("DELETE FROM product_trending WHERE prod_id = $1;", [
    input.prodId,
  ]);

  return sql.query(
    `
      DELETE FROM products
      WHERE prod_id = $1
        AND seller_uid = $2
      RETURNING *;
    `,
    [input.prodId, input.sellerUid]
  );
}
