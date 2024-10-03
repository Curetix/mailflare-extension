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
