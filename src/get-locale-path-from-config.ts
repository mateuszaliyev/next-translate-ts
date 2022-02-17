import { DEFAULT_LOCALE_PATH, INTERPOLATION } from "./constants";
import { log } from "./log";
import type { GetLocalePathFromConfig } from "./types";

export const getLocalePathFromConfig: GetLocalePathFromConfig = (
  loadLocaleFrom
) => {
  const loadLocaleFromAsString = loadLocaleFrom.toString();

  const parenthesisRegExp = /\(([^)]+)\)/g;

  const loadLocaleFromArgumentsMatches =
    loadLocaleFromAsString.matchAll(parenthesisRegExp);

  const [localeArguments, localePath] = Array.from(
    loadLocaleFromArgumentsMatches,
    (matches) => matches[1]
  );

  if (!localeArguments || !localePath) {
    log.warn(
      `could not acquire correct path from \`loadLocaleFrom\` function; proceeding with a default path (\`${DEFAULT_LOCALE_PATH}\`).`
    );
    return DEFAULT_LOCALE_PATH;
  }

  const [localeArgument, namespaceArgument] = localeArguments.split(/,\s*/);

  return localePath
    .replaceAll(/[`'"]+/g, "")
    .replaceAll(`\${${localeArgument}}`, INTERPOLATION.locale)
    .replaceAll(`\${${namespaceArgument}}`, INTERPOLATION.namespace);
};
