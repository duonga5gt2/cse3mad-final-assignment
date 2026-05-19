import type { SqlClient } from "./types";

export type DeletePendingInterestInput = {
  prodId: number;
  userUid: string;
};

export async function deletePendingInterest(
  sql: SqlClient,
  input: DeletePendingInterestInput,
) {
  return sql.query(
    `
      DELETE FROM chats
      WHERE prod_id = $1::integer
        AND user_uid = $2::text
        AND seller_uid <> $2::text
      RETURNING *;
    `,
    [input.prodId, input.userUid],
  );
}
