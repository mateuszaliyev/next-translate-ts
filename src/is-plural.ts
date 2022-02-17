import { PLURALS } from "./constants";

export const isPlural = (key: string): boolean =>
  PLURALS.includes(key) ||
  (!Number.isNaN(Number(key)) && !Number.isNaN(parseInt(key)));
