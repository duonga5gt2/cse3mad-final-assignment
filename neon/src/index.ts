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
  getCurentUser,
  getProdDetail,
  getTrendingProducts,
  getTrendingProductsNext10,
  updateProductDetail,
  updateUserProfile,
} from "./queries";

// INITIALIZE, MIDDLEWARE AND HEALTH CHECKPOINT
initializeApp();

const DATABASE_URL = defineSecret("DATABASE_URL");

const app = express();

app.use(express.json());

type AuthenticatedRequest = Request & {
  user?: DecodedIdToken;
};

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

app.get(
  "/trending",
  authMiddleware,
  async (req: Request, res: Response) => {
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
  },
);

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

app.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
});

app.patch(
  "/me",
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

export const api = onRequest({ secrets: [DATABASE_URL] }, app);
