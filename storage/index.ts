import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/firebase";

const AVATAR_FOLDER = (uid: string) => {
  return `${uid}/avatar/`;
};

const PRODUCTS_FOLDER = (uid: string, prod_id: string) => {
  return `${uid}/products/${prod_id}/`;
};

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  return response.blob();
}

export async function uploadAvatarImage(uid: string, imageUri: string) {
  const imageBlob = await uriToBlob(imageUri);
  const imageRef = ref(storage, `${AVATAR_FOLDER(uid)}profile.jpg`);

  await uploadBytes(imageRef, imageBlob);

  return getDownloadURL(imageRef);
}

export async function uploadProductImage(
  uid: string,
  prodId: string,
  imageUri: string,
  imageIndex: number,
) {
  const imageBlob = await uriToBlob(imageUri);
  const imageRef = ref(
    storage,
    `${PRODUCTS_FOLDER(uid, prodId)}photo-${imageIndex}.jpg`,
  );

  await uploadBytes(imageRef, imageBlob);

  return getDownloadURL(imageRef);
}
