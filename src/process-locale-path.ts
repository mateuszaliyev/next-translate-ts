import { access } from "fs/promises";

import { FILE_NAME_REG_EXP, INTERPOLATION } from "./constants";
import { readDirectoryRecursive } from "./read-directory-recursive";
import type { ProcessLocalePath } from "./types";

export const processLocalePath: ProcessLocalePath = async (path) => {
  const localeSet = new Set<string>();
  const namespaceSet = new Set<string>();

  const getPath = (locale: string, namespace: string): string =>
    path
      .replace(INTERPOLATION.locale, locale)
      .replace(INTERPOLATION.namespace, namespace);

  /* Get base locale directory. */
  const directory = path
    .split(INTERPOLATION.locale)[0]
    .split(INTERPOLATION.namespace)[0];

  /* Check if directory exists */
  try {
    await access(directory);
  } catch (_) {
    throw new Error(
      `directory \`${directory}\` does not exist; try to specify input path with \`-i\` flag.`
    );
  }

  /* Escape backslashes and dots in a path. */
  const processedPath = path.replaceAll("\\", "\\\\").replaceAll(".", "\\.");

  /* Regular expression for testing whether a file matches the pattern. */
  const fileRegExp = new RegExp(
    processedPath
      .replace(INTERPOLATION.locale, FILE_NAME_REG_EXP)
      .replace(INTERPOLATION.namespace, FILE_NAME_REG_EXP)
  );

  /* Regular expression that captures locale. */
  const localeRegExp = new RegExp(
    processedPath
      .replace(INTERPOLATION.locale, `(${FILE_NAME_REG_EXP})`)
      .replace(INTERPOLATION.namespace, FILE_NAME_REG_EXP),
    "g"
  );

  /* Regular expression that captures namespace. */
  const namespaceRegExp = new RegExp(
    processedPath
      .replace(INTERPOLATION.locale, FILE_NAME_REG_EXP)
      .replace(INTERPOLATION.namespace, `(${FILE_NAME_REG_EXP})`),
    "g"
  );

  /* Open locale directory. */
  (await readDirectoryRecursive(directory)).forEach((file) => {
    /* Skip files that don't match the pattern. */
    if (!fileRegExp.test(file)) {
      return;
    }

    /* Get locale from path. */
    const [locale] = Array.from(
      file.matchAll(localeRegExp),
      (matches) => matches[1]
    );

    /* Get namespace from path. */
    const [namespace] = Array.from(
      file.matchAll(namespaceRegExp),
      (matches) => matches[1]
    );

    /* Store newly found locale and namespace. */
    localeSet.add(locale);
    namespaceSet.add(namespace);
  });

  return {
    getPath,
    locales: Array.from(localeSet),
    namespaces: Array.from(namespaceSet),
  };
};
