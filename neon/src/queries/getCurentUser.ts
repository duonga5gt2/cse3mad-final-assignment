import type { SqlClient } from "./types";

export async function getCurentUser(sql: SqlClient, uid: string) {
  return sql.query(
    `
      SELECT
        uid,
        first_name,
        last_name,
        email,
        created_at,
        avatar_url,
        phonenumber
      FROM users
      WHERE uid = $1;
    `,
    [uid]
  );
}
