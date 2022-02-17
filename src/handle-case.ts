export const handleCase = (text: string, camel = false) =>
  camel
    ? text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (leftToRight, index) =>
          index === 0 ? leftToRight.toLowerCase() : leftToRight.toUpperCase()
        )
        .replace(/\s+/g, "")
        .replace("-", "")
    : text;
