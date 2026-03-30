declare module "firebase/auth" {
  import type { Persistence } from "@firebase/auth";

  export * from "@firebase/auth";

  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<unknown>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<unknown>;
  }): Persistence;
}
