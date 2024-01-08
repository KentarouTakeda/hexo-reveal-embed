import { createReadStream, realpathSync } from "fs";
import { globSync } from "glob";

export const revealGeneratorCallback = () => {
  const baseDir = realpathSync(__dirname + "/../node_modules/reveal.js");

  return [
    ...globSync(baseDir + "/dist/**/*", { nodir: true }),
    ...globSync(baseDir + "/plugin/**/*", { nodir: true }),
  ].map((file) => ({
    data: () => createReadStream(file),
    path: "reveal.js/" + file.slice(baseDir.length + 1),
  }));
};
