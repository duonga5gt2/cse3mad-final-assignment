import type { SqlClient } from "./types";

export type CreateChatInput = {
  prodId: number;
  userUid: string;
};

export async function createChat(sql: SqlClient, input: CreateChatInput) {
  return sql.query(
    `
WITH inserted_chat AS (
  INSERT INTO chats (
    seller_uid,
    prod_id,
    user_uid,
    added_at
  )
  SELECT
    p.seller_uid,
    p.prod_id,
    $2::text,
    NOW()
  FROM products p
  WHERE p.prod_id = $1::integer
    AND p.seller_uid <> $2::text
  ON CONFLICT (seller_uid, prod_id, user_uid)
  DO NOTHING
  RETURNING *
)
SELECT *
FROM inserted_chat

UNION ALL

SELECT *
FROM chats
WHERE prod_id = $1::integer
  AND user_uid = $2::text
  AND seller_uid <> $2::text

LIMIT 1;
    `,
    [input.prodId, input.userUid],
  );
}
