import type { SqlClient } from "./types";

export async function deleteUser(sql: SqlClient, uid: string) {
  await sql.query(
    `
      DELETE FROM chats
      WHERE seller_uid = $1
         OR user_uid = $1;
    `,
    [uid]
  );

  await sql.query(
    `
      DELETE FROM product_trending
      WHERE prod_id IN (
        SELECT prod_id
        FROM products
        WHERE seller_uid = $1
      );
    `,
    [uid]
  );

  await sql.query("DELETE FROM products WHERE seller_uid = $1;", [uid]);

  return sql.query(
    `
      DELETE FROM users
      WHERE uid = $1
      RETURNING *;
    `,
    [uid]
  );
}
