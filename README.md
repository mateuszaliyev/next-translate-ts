<h1 align="center">next-translate-ts</h1>

<p align="center">
  Generate <strong>type definitions</strong> for
  <a href="https://github.com/vinissimus/next-translate">next-translate</a>
</p>

**Table of Contents**

- [About](#about)
  - [Features](#features)
  - [How are types generated?](#how-are-types-generated)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Camel case](#camel-case)
  - [Input path](#input-path)
  - [Output path](#output-path)
  - [Thorough search](#thorough-search)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## About

The main goal of this library is to provide the best possible developer experience when using [next-translate](https://github.com/vinissimus/next-translate).

Next-translate-ts is a Node.js CLI tool that generates types based on your [next-translate](https://github.com/vinissimus/next-translate) configuration to produce a fully-typed API.

### Features

- [x] `useTranslation`
- [ ] `withTranslaion`
- [ ] `Trans`
- [ ] `DynamicNamespaces`
- [ ] `getT`
- [ ] `I18nProvider`
- [ ] `appWithI18n`
- [ ] `loadNamespaces`

### How are types generated?

Next-translate-ts will look for your [next-translate configuration file](https://github.com/vinissimus/next-translate#how-are-translations-loaded) (either `i18n.js` or `i18n.json`) and try to deduce where your [namespaces files](https://github.com/vinissimus/next-translate#create-your-namespaces-files) are located.

In order to do this we use configuration file to extract the path from `loadLocaleFrom` method. Default fallback path (`"/locales/<locale>/<namespace>.json"`) will be used in case of a failure.

When the path is obtained, next-translate-ts will read the keys inside of your namespaces files and generate fully-typed equivalents of [next-translate](https://github.com/vinissimus/next-translate#4-api)'s functions in the desired directory.

## Getting started

**Prerequisites**

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Next.js](https://nextjs.org/) [TypeScript](https://www.typescriptlang.org/) project with [next-translate](https://github.com/vinissimus/next-translate) library installed.

## Usage

Run `next-translate-ts`. Make sure you are executing the command from root directory of your [Next.js](https://nextjs.org/) project.

```
npx @matali/next-translate-ts -o path/to/your/output/directory
```

## Configuration

### Camel case

Use `camelCase` for file names.

```
npx @matali/next-translate-ts [--camel|-c]
```

Default `snake-case` naming convention for file names can be replaced with `camelCase` to better suit project's style.

**Example**

```
npx @matali/next-translate-ts -c -o src/nextTranslate
```

|   Default   |          Type          |
| :---------: | :--------------------: |
| `undefined` | `boolean \| undefined` |

### Input path

Specify the location of namespaces files.

```
npx @matali/next-translate-ts [--input|-i] <path>
```

When the configuration file contains `loadLocaleFrom` method that doesn't load namespaces files through dynamic `import()` function with template literal path as an argument, next-translate-ts will be unable to extract a correct path and will fallback to the default one. This option can be used to specify a different path instead.

For next-translate-ts to know where the input files are and which locales and namespaces do they belong to, it needs a path as a string with interpolated `[[[locale]]]` and `[[[namespace]]]` variables.

**Example**

```
npx @matali/next-translate-ts -i src/translations/[[[namespace]]]_[[[locale]]].json -o src/modules/i18n
```

|                   Default                   |         Type          |
| :-----------------------------------------: | :-------------------: |
| `locales/[[[locale]]]/[[[namespace]]].json` | `string \| undefined` |

### Output path

Define the output directory.

```
npx @matali/next-translate-ts [--output|-o] <path>
```

Required. When the directory does not exist at the given path, it will be recursively created. **Please take caution when specifying this path as it will irreversibly override existing files.**

**Example**

```
npx @matali/next-translate-ts -o src/modules/i18n
```

|         Type          |
| :-------------------: |
| `string \| undefined` |

### Thorough search

Read namespaces files for all locales.

```
npx @matali/next-translate-ts [--thorough|-t]
```

By default, next-translate-ts will only read namespaces files for the default locale to save time in projects with many locales. Use this option when more thorough search is needed.

**Example**

```
npx @matali/next-translate-ts -o src/nextTranslate -t
```

|   Default   |          Type          |
| :---------: | :--------------------: |
| `undefined` | `boolean \| undefined` |

## Contributing

Next-translate-ts is a result of a repeating code across many of our projects. We will be adding support for more features if we find the need to use them. Please see our CONTRIBUTING.md if you wanta to contribute to this project.

## Authors

- Mateusz Aliyev (@mateuszaliyev)

## License

Next-translate-ts is icensed under the [MIT](LICENSE) license.