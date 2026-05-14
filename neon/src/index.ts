/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";

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

import { neon } from "@neondatabase/serverless";
import express, { NextFunction, Request, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAuth } from "firebase-admin/auth";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

import {
  createNewProduct,
  createNewUser,
  getCurentUser,
  getProdDetail,
  getTrendingProducts,
  getTrendingProductsNext10,
  searchForItem,
  updateProductDetail,
  updateUserProfile,
  updateTrend,
} from "./queries";

// INITIALIZE, MIDDLEWARE AND HEALTH CHECKPOINT
initializeApp();

const DATABASE_URL = defineSecret("DATABASE_URL");
const AI_KEY = defineSecret("AI_KEY");

const app = express();

app.use(express.json());

type AuthenticatedRequest = Request & {
  user?: DecodedIdToken;
};

type EmbeddingsResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
  error?: {
    message?: string;
  };
};

function buildProductEmbeddingText(input: {
  title: string;
  description: string;
  pickUpLocationText: string;
}) {
  return [
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Pickup location: ${input.pickUpLocationText}`,
  ].join("\n");
}

function vectorToPgVector(vector: number[]) {
  return `[${vector.join(",")}]`;
}

async function embedTextToVector(text: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    }),
  });

  const data = (await response.json()) as EmbeddingsResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to embed product text.");
  }

  const embedding = data.data?.[0]?.embedding;

  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding response did not include a vector.");
  }

  return vectorToPgVector(embedding);
}

async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing auth token" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch {
    res.status(401).json({ error: "Invalid auth token" });
  }
}

export function emailVerifiedMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({ error: "Missing authenticated user" });
    return;
  }

  if (!req.user.email_verified) {
    res.status(403).json({ error: "Email is not verified" });
    return;
  }

  next();
}

app.get("/health-check", (req: Request, res: Response) => {
  res.send("Hello from Firebase Functions!");
});
// ---------------------------------

// Get Trending Products

app.get("/trending", authMiddleware, async (req: Request, res: Response) => {
  try {
    const connectionString = DATABASE_URL.value();

    if (!connectionString) {
      res.status(500).json({
        ok: false,
        error: "DATABASE_URL is not configured.",
      });
      return;
    }

    const sql = neon(connectionString);
    const products = await getTrendingProducts(sql);

    res.status(200).json({
      ok: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to fetch trending products.",
    });
  }
});

app.get(
  "/trending-next",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const lastTrendingScore = Number(req.query.lastTrendingScore);
      const lastProdId = Number(req.query.lastProdId);

      if (
        !Number.isFinite(lastTrendingScore) ||
        !Number.isInteger(lastProdId)
      ) {
        res.status(400).json({
          ok: false,
          error: "lastTrendingScore and lastProdId query params are required.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const products = await getTrendingProductsNext10(sql, {
        lastTrendingScore,
        lastProdId,
      });

      res.status(200).json({
        ok: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch next trending products.",
      });
    }
  },
);

app.get(
  "/search-products",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const searchText = String(req.query.q ?? "").trim();

      if (searchText.length < 2) {
        res.status(400).json({
          ok: false,
          error: "Search query must be at least 2 characters.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();
      const aiKey = AI_KEY.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      if (!aiKey) {
        res.status(500).json({
          ok: false,
          error: "AI_KEY is not configured.",
        });
        return;
      }

      const prodVector = await embedTextToVector(searchText, aiKey);
      const sql = neon(connectionString);
      const products = await searchForItem(sql, {
        prodVector,
        searchText,
      });

      res.status(200).json({
        ok: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to search products.",
      });
    }
  },
);

app.get(
  "/products/:prodId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const prodId = Number(req.params.prodId);

      if (!Number.isInteger(prodId)) {
        res.status(400).json({
          ok: false,
          error: "prodId must be a valid integer.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const products = await getProdDetail(sql, prodId);

      if (products.length === 0) {
        res.status(404).json({
          ok: false,
          error: "Product not found.",
        });
        return;
      }

      res.status(200).json({
        ok: true,
        data: products[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch product detail.",
      });
    }
  },
);

app.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({
          ok: false,
          error: "Missing authenticated user.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const users = await getCurentUser(sql, uid);

      if (users.length === 0) {
        res.status(404).json({
          ok: false,
          error: "User not found.",
        });
        return;
      }

      res.status(200).json({
        ok: true,
        data: users[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch current user.",
      });
    }
  },
);

app.post(
  "/users",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({
          ok: false,
          error: "Missing authenticated user.",
        });
        return;
      }

      const { firstName, lastName, email, avatarUrl, phoneNumber } = req.body;

      if (!firstName || !lastName || !email || !phoneNumber) {
        res.status(400).json({
          ok: false,
          error: "firstName, lastName, phoneNumber, and email are required.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const users = await createNewUser(sql, {
        uid,
        firstName,
        lastName,
        email,
        avatarUrl,
        phoneNumber,
      });

      res.status(201).json({
        ok: true,
        data: users[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to register new user.",
      });
    }
  },
);

app.post(
  "/products/:prodId/trending",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prodId = Number(req.params.prodId);
      const clicks =
        req.body.clicks === undefined ? 1 : Number(req.body.clicks);

      if (!Number.isInteger(prodId)) {
        res.status(400).json({
          ok: false,
          error: "prodId must be a valid integer.",
        });
        return;
      }

      if (!Number.isInteger(clicks) || clicks < 1) {
        res.status(400).json({
          ok: false,
          error: "clicks must be a positive integer.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const trendingRows = await updateTrend(sql, {
        prodId,
        clicks,
      });

      res.status(200).json({
        ok: true,
        data: trendingRows[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product trend.",
      });
    }
  },
);

app.post(
  "/products",
  authMiddleware,
  emailVerifiedMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({
          ok: false,
          error: "Missing authenticated user.",
        });
        return;
      }

      const {
        title,
        description,
        price,
        pickUpLocationText,
        longitude,
        latitude,
        productPhotoUrl1,
        productPhotoUrl2,
        productPhotoUrl3,
      } = req.body;

      const numericPrice = Number(price);
      const numericLongitude = Number(longitude);
      const numericLatitude = Number(latitude);

      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof pickUpLocationText !== "string" ||
        !title.trim() ||
        !description.trim() ||
        !pickUpLocationText.trim() ||
        !Number.isFinite(numericPrice) ||
        !Number.isFinite(numericLongitude) ||
        !Number.isFinite(numericLatitude)
      ) {
        res.status(400).json({
          ok: false,
          error:
            "title, description, price, pickUpLocationText, longitude, and latitude are required.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();
      const aiKey = AI_KEY.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      if (!aiKey) {
        res.status(500).json({
          ok: false,
          error: "AI_KEY is not configured.",
        });
        return;
      }

      const prodVector = await embedTextToVector(
        buildProductEmbeddingText({
          title: title.trim(),
          description: description.trim(),
          pickUpLocationText: pickUpLocationText.trim(),
        }),
        aiKey,
      );

      const sql = neon(connectionString);
      const products = await createNewProduct(sql, {
        sellerUid: uid,
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        pickUpLocationText: pickUpLocationText.trim(),
        longitude: numericLongitude,
        latitude: numericLatitude,
        productPhotoUrl1,
        productPhotoUrl2,
        productPhotoUrl3,
        prodVector,
      });

      res.status(201).json({
        ok: true,
        data: products[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create new product.",
      });
    }
  },
);

app.patch(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({
          ok: false,
          error: "Missing authenticated user.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const users = await updateUserProfile(sql, {
        uid,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatarUrl: req.body.avatarUrl,
        phoneNumber: req.body.phoneNumber,
      });

      if (users.length === 0) {
        res.status(404).json({
          ok: false,
          error: "User not found.",
        });
        return;
      }

      res.status(200).json({
        ok: true,
        data: users[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update user profile.",
      });
    }
  },
);

app.patch(
  "/products/:prodId",
  authMiddleware,
  emailVerifiedMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      const prodId = Number(req.params.prodId);

      if (!uid) {
        res.status(401).json({
          ok: false,
          error: "Missing authenticated user.",
        });
        return;
      }

      if (!Number.isInteger(prodId)) {
        res.status(400).json({
          ok: false,
          error: "prodId must be a valid integer.",
        });
        return;
      }

      const connectionString = DATABASE_URL.value();

      if (!connectionString) {
        res.status(500).json({
          ok: false,
          error: "DATABASE_URL is not configured.",
        });
        return;
      }

      const sql = neon(connectionString);
      const products = await updateProductDetail(sql, {
        prodId,
        sellerUid: uid,
        description: req.body.description,
        title: req.body.title,
        price: req.body.price,
        pickUpLocationText: req.body.pickUpLocationText,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        productPhotoUrl1: req.body.productPhotoUrl1,
        productPhotoUrl2: req.body.productPhotoUrl2,
        productPhotoUrl3: req.body.productPhotoUrl3,
        prodVector: req.body.prodVector,
      });

      if (products.length === 0) {
        res.status(404).json({
          ok: false,
          error: "Product not found or you do not have permission to edit it.",
        });
        return;
      }

      res.status(200).json({
        ok: true,
        data: products[0],
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product detail.",
      });
    }
  },
);

export const api = onRequest({ secrets: [DATABASE_URL, AI_KEY] }, app);
