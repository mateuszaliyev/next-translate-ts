#!/usr/bin/env node

import { Command } from "commander";

import { generate } from "./generate";
import { log } from "./log";
import { Generate } from "./types";

const program = new Command();

program
  .name("next-translate-ts")
  .description("Generate TypeScript definitions for next-translate")
  .version("0.1.0")
  .option(
    "-c, --camel",
    "use `camelCase` instead of `snake-case` for file names"
  )
  .option(
    "-i, --input <path>",
    "locale path template, where `[[[locale]]]` and `[[[namespace]]]` specify locale and namespace names respectively (default: `./src/locales/[[[locale]]]/[[[namespace]]].json`)"
  )
  .requiredOption(
    "-o, --output <path>",
    "output directory path (required) (e.g. `./src/modules/i18n/`)"
  )
  .option(
    "-p, --prettier <path>",
    "prettier configuration file path (e.g. `./.prettierrc`)"
  )
  .option(
    "-t, --thorough",
    "read through namespace files for every locale instead of a default one only"
  )
  .action((options: Parameters<Generate>[0]) => {
    generate(options).catch((error: Error) => {
      log.error(error.message);
      process.exit(1);
    });
  });

program.parse();
