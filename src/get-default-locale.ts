import type { NextTranslateConfig } from "./types";

export const getDefaultLocale = (
  { defaultLocale, locales, localesToIgnore }: NextTranslateConfig,
  foundLocales: string[]
): string => {
  if (
    defaultLocale &&
    !(localesToIgnore && localesToIgnore.includes(defaultLocale))
  ) {
    return defaultLocale;
  }

  return (
    locales?.find(
      (locale) => !(localesToIgnore && localesToIgnore.includes(locale))
    ) ?? foundLocales[0]
  );
};
