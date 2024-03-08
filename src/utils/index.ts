import { useMediaQuery } from "@mantine/hooks";

/**
 * Error class for failed fetch requests.
 */
export class FetcherHttpError extends Error {
  info: any;
  status = 200;
}

/**
 * Use native fetch and return the typed JSON response.
 */
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
  throwHttp = true,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok && throwHttp) {
    const error = new FetcherHttpError(`An HTTP error ${res.status} occurred.`);
    error.info = await res.json().catch(() => res.body);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Sort an array of objects of type T by the provided key and direction.
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sortby-and-_orderby
 */
export function sortBy<T>(key: keyof T, direction: "ascending" | "descending" = "ascending") {
  if (direction === "ascending") {
    return (a: T, b: T) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
  }
  return (a: T, b: T) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0);
}

export function randomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function useFullscreenModal() {
  return useMediaQuery("(max-width: 600px)");
}
