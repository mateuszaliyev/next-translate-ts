export type Generate = (options: {
  camel?: true;
  input?: string;
  output: string;
  prettier?: string;
  thorough?: true;
}) => Promise<void>;

export type GetLocalePathFromConfig = (loadLocaleFrom: LocaleLoader) => string;

export interface I18n {
  locales: string[];
  namespaces: Record<
    string,
    Record<string, { components: number; variables: string[] }>
  >;
}

export interface I18nDictionary {
  [key: string]: string | I18nDictionary;
}

export interface I18nLogger {
  (context: LoggerProps): void;
}

export type Json = JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonObject
  | JsonValue[];

export type LocaleLoader = (
  language: string | undefined,
  namespace: string
) => Promise<I18nDictionary>;

export interface LoggerProps {
  i18nKey: string;
  namespace: string | undefined;
}

export interface NextTranslateConfig {
  defaultLocale?: string;
  defaultNS?: string;
  interpolation?: {
    format?: (value: string, format: string, lang: string) => string;
    prefix: string;
    suffix: string;
  };
  keySeparator?: string | false;
  loadLocaleFrom?: LocaleLoader;
  loader?: boolean;
  locales?: string[];
  localesToIgnore?: string[];
  logBuild?: boolean;
  logger?: I18nLogger;
  nsSeparator?: string | false;
  pages?: Record<string, PageValue>;
  revalidate?: number;
  staticsHoc?: (...args: unknown[]) => unknown;
}

export type PageValue =
  | string[]
  | ((context: Record<string, unknown>) => string[]);

export type ProcessLocalePath = (path: string) => Promise<{
  getPath: (locale: string, namespace: string) => string;
  locales: string[];
  namespaces: string[];
}>;
