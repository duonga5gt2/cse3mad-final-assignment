import type { NeonQueryFunction } from "@neondatabase/serverless";

export type SqlClient = NeonQueryFunction<false, false>;

export type Nullable<T> = T | null | undefined;
