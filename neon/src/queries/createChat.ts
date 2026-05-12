import type { SqlClient } from "./types";

export type CreateChatInput = {
  sellerUid: string;
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
  VALUES (
    $1,
    $2,
    $3,
    NOW()
  )
  ON CONFLICT (seller_uid, prod_id, user_uid)
  DO NOTHING
  RETURNING *
)
SELECT *
FROM inserted_chat

UNION ALL

SELECT *
FROM chats
WHERE seller_uid = $1
  AND prod_id = $2
  AND user_uid = $3

LIMIT 1;
    `,
    [input.sellerUid, input.prodId, input.userUid],
  );
}
