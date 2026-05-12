import type { Nullable, SqlClient } from "./types";

export type UpdateUserProfileInput = {
  uid: string;
  firstName?: Nullable<string>;
  lastName?: Nullable<string>;
  email?: Nullable<string>;
  avatarUrl?: Nullable<string>;
  phoneNumber?: Nullable<string>;
};

export async function updateUserProfile(
  sql: SqlClient,
  input: UpdateUserProfileInput
) {
  return sql.query(
    `
      UPDATE users
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        avatar_url = COALESCE($4, avatar_url),
        phonenumber = COALESCE($5, phonenumber)
      WHERE uid = $6
      RETURNING *;
    `,
    [
      input.firstName ?? null,
      input.lastName ?? null,
      input.email ?? null,
      input.avatarUrl ?? null,
      input.phoneNumber ?? null,
      input.uid,
    ]
  );
}
