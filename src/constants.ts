export const CASES = ["camel", "snake"];

export const COMPONENT_REG_EXP = "<(\\d+)>" as const;
export const FILE_NAME_REG_EXP = "[-.0-9A-Z\\[\\]_a-z]+?" as const;
export const VARIABLE_NAME_REG_EXP = "[$A-Z_a-z][\\w$]*" as const;

export const INTERPOLATION = {
  locale: "[[[locale]]]",
  namespace: "[[[namespace]]]",
  prefix: "{{",
  suffix: "}}",
} as const;

export const DEFAULT_LOCALE_PATH =
  `./locales/${INTERPOLATION.locale}/${INTERPOLATION.namespace}.json` as const;

export const PLURALS = ["zero", "one", "two", "few", "many", "other"];
