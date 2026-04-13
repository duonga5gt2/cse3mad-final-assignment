/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { neon } from "@neondatabase/serverless";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({
  maxInstances: 10,
  region: "australia-southeast1",
});

const DATABASE_URL = defineSecret("DATABASE_URL");

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const testDb = onRequest({ secrets: [DATABASE_URL] }, async (request, response) => {
  if (request.method !== "GET") {
    response.status(405).json({
      ok: false,
      message: "Method not allowed. Use GET.",
    });
    return;
  }

  try {
    const connectionString = DATABASE_URL.value();

    if (!connectionString) {
      response.status(500).json({
        ok: false,
        message: "DATABASE_URL is not configured.",
      });
      return;
    }

    const sql = neon(connectionString);
    const result = await sql`
      SELECT
        1 AS connected,
        current_database() AS database_name,
        NOW() AS server_time
    `;

    response.status(200).json({
      ok: true,
      message: "Database connection successful.",
      data: result[0],
    });
  } catch (error) {
    logger.error("Database connection test failed", error);

    response.status(500).json({
      ok: false,
      message: "Database connection failed.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
