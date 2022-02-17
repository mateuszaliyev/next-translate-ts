import { readdir, readFile } from "fs/promises";
import { resolve } from "path";

import { log } from "./log";
import type { NextTranslateConfig } from "./types";

const configFileNames = ["i18n.js", "i18n.json"];

export const getNextTranslateConfig = async (
  path: string
): Promise<NextTranslateConfig> => {
  const files = await readdir(path);

  const configFiles = files.filter((file) => configFileNames.includes(file));

  if (configFiles.length === 0) {
    throw new Error("configuration file is missing");
  }

  if (configFiles.length === 2) {
    log.warn(
      "found multiple configuration files:\n",
      configFiles.reduce(
        (result, configFile) => `${result}- ${configFile}\n`,
        ""
      ),
      `continuing with ${configFiles[0]}`
    );
  }

  const configFileFormat = configFiles[0].split(".")[1];

  if (configFileFormat === "js") {
    return (await import(resolve(path, configFiles[0]))) as NextTranslateConfig;
  }

  if (configFileFormat === "json") {
    const i18nFile = await readFile(resolve(path, configFiles[0]), "utf-8");

    return JSON.parse(i18nFile) as NextTranslateConfig;
  }

  throw new Error("incorrect configuration file format");
};
