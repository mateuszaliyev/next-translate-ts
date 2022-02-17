import { lstat, readdir } from "fs/promises";
import { resolve } from "path";

export const readDirectoryRecursive = async (
  path: string
): Promise<string[]> => {
  const rootDirectory = await readdir(path);

  const result: string[] = [];

  const stack: string[] = [
    ...rootDirectory.map((directoryOrFile) => resolve(path, directoryOrFile)),
  ];

  while (stack.length) {
    const directoryOrFile = stack.pop() as string;

    if ((await lstat(resolve(path, directoryOrFile))).isFile()) {
      result.push(resolve(path, directoryOrFile));
      continue;
    }

    const directory = await readdir(directoryOrFile);

    stack.push(
      ...directory.map((nextDirectoryOrFile) =>
        resolve(directoryOrFile, nextDirectoryOrFile)
      )
    );
  }

  return result;
};
