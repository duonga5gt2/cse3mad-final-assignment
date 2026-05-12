import type { SqlClient } from "./types";

export type CreateNewUserInput = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
};

export async function createNewUser(sql: SqlClient, input: CreateNewUserInput) {
  return sql.query(
    `
      INSERT INTO users (
        uid,
        first_name,
        last_name,
        email,
        created_at,
        avatar_url,
        phonenumber
      )
      VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      RETURNING *;
    `,
    [
      input.uid,
      input.firstName,
      input.lastName,
      input.email,
      input.avatarUrl ?? null,
      input.phoneNumber ?? null,
    ]
  );
}
