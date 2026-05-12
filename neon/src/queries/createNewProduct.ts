import type { SqlClient } from "./types";

export type CreateNewProductInput = {
  sellerUid: string;
  description: string;
  title: string;
  price: number;
  pickUpLocationText: string;
  longitude: number;
  latitude: number;
  productPhotoUrl1?: string | null;
  productPhotoUrl2?: string | null;
  productPhotoUrl3?: string | null;
  prodVector: string;
};

export async function createNewProduct(
  sql: SqlClient,
  input: CreateNewProductInput
) {
  return sql.query(
    `
      INSERT INTO products (
        seller_uid,
        description,
        title,
        price,
        pick_up_location_text,
        pick_up_location_gis,
        created_at,
        is_sold,
        product_photo_url_1,
        product_photo_url_2,
        product_photo_url_3,
        prod_vector
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        ST_SetSRID(ST_MakePoint($6, $7), 4283),
        NOW(),
        false,
        $8,
        $9,
        $10,
        $11::vector
      )
      RETURNING *;
    `,
    [
      input.sellerUid,
      input.description,
      input.title,
      input.price,
      input.pickUpLocationText,
      input.longitude,
      input.latitude,
      input.productPhotoUrl1 ?? null,
      input.productPhotoUrl2 ?? null,
      input.productPhotoUrl3 ?? null,
      input.prodVector,
    ]
  );
}
