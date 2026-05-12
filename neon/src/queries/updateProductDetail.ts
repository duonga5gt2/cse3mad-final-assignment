import type { Nullable, SqlClient } from "./types";

export type UpdateProductDetailInput = {
  prodId: number;
  sellerUid: string;
  description?: Nullable<string>;
  title?: Nullable<string>;
  price?: Nullable<number>;
  pickUpLocationText?: Nullable<string>;
  longitude?: Nullable<number>;
  latitude?: Nullable<number>;
  productPhotoUrl1?: Nullable<string>;
  productPhotoUrl2?: Nullable<string>;
  productPhotoUrl3?: Nullable<string>;
  prodVector?: Nullable<string>;
};

export async function updateProductDetail(
  sql: SqlClient,
  input: UpdateProductDetailInput
) {
  return sql.query(
    `
      UPDATE products
      SET
        description = COALESCE($1, description),
        title = COALESCE($2, title),
        price = COALESCE($3, price),
        pick_up_location_text = COALESCE($4, pick_up_location_text),
        pick_up_location_gis =
          CASE
            WHEN $5 IS NOT NULL AND $6 IS NOT NULL
            THEN ST_SetSRID(ST_MakePoint($5, $6), 4283)
            ELSE pick_up_location_gis
          END,
        product_photo_url_1 = COALESCE($7, product_photo_url_1),
        product_photo_url_2 = COALESCE($8, product_photo_url_2),
        product_photo_url_3 = COALESCE($9, product_photo_url_3),
        prod_vector =
          CASE
            WHEN $10 IS NOT NULL
            THEN $10::vector
            ELSE prod_vector
          END
      WHERE prod_id = $11
        AND seller_uid = $12
      RETURNING *;
    `,
    [
      input.description ?? null,
      input.title ?? null,
      input.price ?? null,
      input.pickUpLocationText ?? null,
      input.longitude ?? null,
      input.latitude ?? null,
      input.productPhotoUrl1 ?? null,
      input.productPhotoUrl2 ?? null,
      input.productPhotoUrl3 ?? null,
      input.prodVector ?? null,
      input.prodId,
      input.sellerUid,
    ]
  );
}
