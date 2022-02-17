import { writeFile } from "fs/promises";

import { format, Options } from "prettier";

export const generateFile = async (
  path: string,
  data: string,
  options?: Options
) => {
  const formattedData = format(data, {
    parser: "typescript",
    ...options,
  });

  await writeFile(path, formattedData);
};
