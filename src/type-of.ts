export const typeOf = (object: unknown) => {
  const match = {}.toString.call(object).match(/\s([^\]]+)/);

  if (match) {
    return match[1].toLowerCase();
  }

  return "undefined";
};
