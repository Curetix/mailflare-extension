import { extensionLocalStorageInterface as storage, StorageKeys } from "~/utils/storage";

export async function isAuthenticated() {
  const apiToken = await storage.getItem(StorageKeys.ApiToken, undefined);
  return apiToken !== undefined;
}

export async function hasSeenLandingPage() {
  return await storage.getItem(StorageKeys.SeenLandingPage, false);
}
