import { mkdir, readFile } from "fs/promises";
import { resolve } from "path";

import { resolveConfig } from "prettier";

import {
  COMPONENT_REG_EXP,
  DEFAULT_LOCALE_PATH,
  INTERPOLATION,
  VARIABLE_NAME_REG_EXP,
} from "./constants";
import { escapeRegExp } from "./escape-reg-exp";
import { generateFile } from "./generate-file";
import { getDefaultLocale } from "./get-default-locale";
import { getLocalePathFromConfig } from "./get-locale-path-from-config";
import { getNextTranslateConfig } from "./get-next-translate-config";
import { handleCase } from "./handle-case";
import { isPlural } from "./is-plural";
import { log } from "./log";
import { processLocalePath } from "./process-locale-path";
import { typeOf } from "./type-of";
import type { Generate, I18n, JsonObject } from "./types";

export const generate: Generate = async ({
  camel,
  input,
  output,
  prettier,
  thorough,
}) => {
  /* Define i18n object. */
  const i18n: I18n = {
    locales: [],
    namespaces: {},
  };

  /* Get next-translate config. */
  const nextTranslateConfig = await getNextTranslateConfig(
    resolve(process.cwd())
  );

  let inputPath = input;

  if (!inputPath) {
    /* If `loadLocaleFrom` function is defined, try to extract path from it. Otherwise use default path. */
    inputPath = nextTranslateConfig.loadLocaleFrom
      ? getLocalePathFromConfig(nextTranslateConfig.loadLocaleFrom)
      : DEFAULT_LOCALE_PATH;
  }

  /* Get locales and namespaces from the locale path. */
  const { getPath, locales, namespaces } = await processLocalePath(
    resolve(process.cwd(), inputPath)
  );

  /* Store locales and namespaces. */
  i18n.locales.push(...locales);
  namespaces.forEach((namespace) => (i18n.namespaces[namespace] = {}));

  /* Declare component regular expression. */
  const componentRegExp = new RegExp(COMPONENT_REG_EXP, "g");

  /* Declare key and namespace separators. */
  const keySeparator = nextTranslateConfig.keySeparator || ".";
  const namespaceSeparator = nextTranslateConfig.nsSeparator || ":";

  /* Declare variable regular expression. */
  const prefix = escapeRegExp(
    nextTranslateConfig.interpolation?.prefix ?? INTERPOLATION.prefix
  );

  const suffix = escapeRegExp(
    nextTranslateConfig.interpolation?.suffix ?? INTERPOLATION.suffix
  );

  const variableRegExp = new RegExp(
    `${prefix}(${VARIABLE_NAME_REG_EXP})${suffix}`,
    "g"
  );

  /* Select a default locale based on properties of next-translate config and found locales. */
  const defaultLocale = getDefaultLocale(nextTranslateConfig, i18n.locales);

  /* Get default namespace */
  let defaultNamespace = nextTranslateConfig.defaultNS;

  if (
    defaultNamespace &&
    !Object.keys(i18n.namespaces).includes(defaultNamespace)
  ) {
    log.warn("`defaultNS` property is not a correct namespace");
    defaultNamespace = undefined;
  }

  /* If `thorough` option was selected, loop through all locales. Otherwise use default locale. */
  const localesToLoopThrough = thorough ? i18n.locales : [defaultLocale];

  for (const locale of localesToLoopThrough) {
    for (const namespace of Object.keys(i18n.namespaces)) {
      /* Initialize a namespace if not already initialized. */
      if (!i18n.namespaces[namespace]) {
        i18n.namespaces[namespace] = {};
      }

      /* Open the file and parse it as JSON. */
      const json = JSON.parse(
        await readFile(getPath(locale, namespace), "utf-8")
      ) as JsonObject;

      /* Declare stack for recursive search. */
      const stack: string[][] = Object.keys(json).map((key) => [key]);

      /* Loop through all JSON keys. */
      while (stack.length) {
        /* Get the keys. */
        const keys = stack.pop();

        if (!keys) {
          continue;
        }

        /* Get nested property value. */
        const property = keys.reduce(
          (result, key) => result[key] as JsonObject,
          json
        );

        /* Check the type of the property. */
        const typeOfProperty = typeOf(property);

        if (typeOfProperty === "object") {
          /* If value is a nested object, push all of its keys to the stack. */
          Object.keys(property).forEach((key) => {
            stack.push([...keys, key]);
          });

          continue;
        }

        if (typeOfProperty === "string") {
          /* Check whether the key is a plural. */
          let isKeyPlural = false;

          if (keys.length > 1) {
            isKeyPlural = isPlural(keys[keys.length - 1]);
          } else if (keys[keys.length - 1].includes("_")) {
            const splitKey = keys[keys.length - 1].split("_");
            isKeyPlural = isPlural(splitKey[splitKey.length - 1]);
          }

          /* Concatenate keys into one key. */
          const key = isKeyPlural
            ? keys.slice(0, keys.length - 1).join(".")
            : keys.join(keySeparator);

          /* Discard empty keys */
          if (key === "") {
            continue;
          }

          /* Initialize a key if not already initialized. */
          if (!i18n.namespaces[namespace][key]) {
            i18n.namespaces[namespace][key] = {
              components: 0,
              variables: [],
            };
          }

          /* Cast value to a string. */
          const value = property as unknown as string;

          /* Get components from value. */
          const components = Array.from(
            value.matchAll(componentRegExp),
            (matches) => matches[1]
          );

          /* Get variables from value. */
          const variables = Array.from(
            value.matchAll(variableRegExp),
            (matches) => matches[1]
          );

          /* If key is plural, add `count` variable. */
          if (isKeyPlural) {
            variables.push("count");
          }

          /* Make sure variables are unique. */
          const variablesSet = new Set(
            i18n.namespaces[namespace][key].variables
          );
          variables.forEach((variable) => variablesSet.add(variable));

          /* Store components and variables. */
          i18n.namespaces[namespace][key].components = components.length;
          i18n.namespaces[namespace][key].variables = Array.from(variablesSet);

          continue;
        }
      }
    }
  }

  /* Import prettier configuration if possible. */
  const prettierConfig =
    (await resolveConfig(
      prettier ? resolve(process.cwd(), prettier) : resolve(process.cwd())
    )) ?? undefined;

  /* Create output directory. */
  await mkdir(resolve(process.cwd(), output), { recursive: true });

  /* Generate `types` file. */
  const typesFile = `
    export type AnyNamespace = Namespace | undefined;

    export interface Data {
      ${Object.entries(i18n.namespaces)
        .sort(([namespaceA], [namespaceB]) =>
          namespaceA < namespaceB ? -1 : 1
        )
        .reduce(
          (result, [namespace, keys], index) =>
            `${result}${index === 0 ? "" : ";"}"${namespace}": {
              ${Object.entries(keys)
                .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : 1))
                .reduce(
                  (result, [key, { components, variables }], index) =>
                    `${result}${index === 0 ? "" : ";"}"${key}": {
                      components: ${components};
                      variables: ${
                        variables.length
                          ? variables
                              .sort()
                              .reduce(
                                (result, variable, index) =>
                                  `${result}${
                                    index === 0 ? "" : " | "
                                  }"${variable}"`,
                                ""
                              )
                          : "never"
                      };
                    }`,
                  ""
                )}
            }`,
          ""
        )}
    }

    export type DefaultNamespace = ${
      defaultNamespace ? `"${defaultNamespace}"` : "undefined"
    };

    export interface I18n<N extends AnyNamespace = DefaultNamespace> {
      lang: Locale;
      t: Translate<N>;
    }
    
    export type I18nKey<N extends AnyNamespace = DefaultNamespace> = N extends undefined
      ? keyof {
          [K in Namespace as NamespaceKeys<K>]: never;
        }
      :
          | Key<ToNamespace<N>>
          | keyof {
              [K in Exclude<Namespace, N> as NamespaceKeys<K>]: never;
            };
    
    export type Key<N extends Namespace> = keyof Data[N];

    export type Locale = ${i18n.locales
      .sort()
      .reduce(
        (result, locale, index) =>
          `${result}${index === 0 ? "" : " | "}"${locale}"`,
        ""
      )};

    export type Namespace = keyof Data;

    export type NamespaceKeys<N extends Namespace> = \`\${N}${namespaceSeparator}\${string &
      keyof Data[N]}\`;

    export type Nullish = null | undefined;

    export type Query<
      N extends AnyNamespace,
      K extends I18nKey<N>
    > = K extends \`\${infer A}${namespaceSeparator}\${infer B}\`
      ? A extends keyof Data
        ? B extends keyof Data[A]
          ? "variables" extends keyof Data[A][B]
            ? Data[A][B]["variables"] extends never
              ? Nullish
              : Record<Extract<Data[A][B]["variables"], string>, unknown>
            : never
          : never
        : never
      : N extends undefined
      ? never
      : K extends keyof Data[ToNamespace<N>]
      ? "variables" extends keyof Data[ToNamespace<N>][K]
        ? Data[ToNamespace<N>][K]["variables"] extends never
          ? Nullish
          : Record<Extract<Data[ToNamespace<N>][K]["variables"], string>, unknown>
        : never
      : never;
    
    export type ToNamespace<N extends AnyNamespace> = N extends undefined
      ? never
      : N;
    
    export type Translate<N extends AnyNamespace = DefaultNamespace> = <
      K extends I18nKey<N>,
      R extends boolean = false
    >(
      i18nKey: K,
      query?: Query<N, K>,
      options?: {
        default?: string;
        fallback?: I18nKey | I18nKey[];
        ns?: Namespace;
        returnObjects?: R;
      }
    ) => R extends true ? Record<string, unknown> | unknown[] : string;
    
    export type UseTranslation = <N extends AnyNamespace = DefaultNamespace>(
      defaultNamespace?: N
    ) => I18n<N>;
  `;

  const typesFileName = "types.ts";

  await generateFile(
    resolve(process.cwd(), output, typesFileName),
    typesFile,
    prettierConfig
  );

  log.info(`generated \`${typesFileName}\` file`);

  /* Generate `use-translation` file. */
  const useTranslationFile = `
    import useNextTranslateTranslation from "next-translate/useTranslation";

    import type { UseTranslation } from "./types";
    
    export const useTranslation: UseTranslation = (defaultNamespace) =>
      useNextTranslateTranslation(defaultNamespace) as ReturnType<UseTranslation>;
  `;

  const useTranslationFileName = `${handleCase("use-translation", camel)}.ts`;

  await generateFile(
    resolve(process.cwd(), output, useTranslationFileName),
    useTranslationFile,
    prettierConfig
  );

  log.info(`generated \`${useTranslationFileName}\` file`);

  /* Generate `index` file. */
  const indexFile = `
    export * from "./types";
    export { useTranslation } from "./${handleCase("use-translation", camel)}"
  `;

  const indexFileName = "index.ts";

  await generateFile(
    resolve(process.cwd(), output, indexFileName),
    indexFile,
    prettierConfig
  );

  log.info(`generated \`${indexFileName}\` file`);
};
