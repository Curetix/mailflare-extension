import randomWords from "random-words";

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

export function generateAlias(
  type: "characters" | "words" = "characters",
  length = 5,
  words = 3,
  separator = "-",
  prefix?: string,
  prefixSeparator = "-",
): string {
  const aliasPrefix = prefix.trim() !== "" ? `${prefix}${prefixSeparator}` : "";
  switch (type) {
    case "characters":
      return `${aliasPrefix}${randomString(length)}`;
    case "words":
      return `${aliasPrefix}${randomWords({ exactly: words, separator })}`;
    default:
      throw new Error("Invalid alias type.");
  }
}
