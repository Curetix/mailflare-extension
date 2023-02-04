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
  format: "characters" | "words" = "characters",
  characterCount = 5,
  wordCount = 2,
  separator = "_",
  prefix?: string,
): string {
  const aliasPrefix = prefix && prefix.trim() !== "" ? `${prefix}${separator}` : "";
  switch (format) {
    case "characters":
      return `${aliasPrefix}${randomString(characterCount)}`;
    case "words":
      return `${aliasPrefix}${randomWords({ exactly: wordCount, join: separator })}`;
    default:
      throw new Error("Invalid alias type.");
  }
}
