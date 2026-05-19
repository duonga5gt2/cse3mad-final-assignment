import type { SqlClient } from "./types";

export type DeleteProductsAndItsRecordInput = {
  prodId: number;
  sellerUid: string;
};

export async function deleteProductsAndItsRecord(
  sql: SqlClient,
  input: DeleteProductsAndItsRecordInput,
) {
  return sql.query(
    `
      WITH target_product AS (
        SELECT prod_id
        FROM products
        WHERE prod_id = $1
          AND seller_uid = $2
      ),
      deleted_chats AS (
        DELETE FROM chats
        WHERE prod_id IN (SELECT prod_id FROM target_product)
      ),
      deleted_trending AS (
        DELETE FROM product_trending
        WHERE prod_id IN (SELECT prod_id FROM target_product)
      )
      DELETE FROM products
      WHERE prod_id IN (SELECT prod_id FROM target_product)
      RETURNING *;
    `,
    [input.prodId, input.sellerUid],
  );
}
