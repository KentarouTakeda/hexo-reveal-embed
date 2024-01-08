import type Hexo from "hexo";
import { mkdir, rm, writeFile } from "fs/promises";
import { join, dirname } from "path";

export async function revealProcessorCallback(this: Hexo, file: Hexo.Box.File) {
  if (file.type === "skip") {
    return;
  }

  const filename = getFilename(this, file);

  if (file.type === "delete") {
    await rm(filename);

    return;
  }

  if (file.type === "update" || file.type === "create") {
    const body = await file.read({encoding: "utf-8"});
    await mkdir(dirname(filename), {recursive: true});
    await writeFile(filename, body);

    return;
  }

  const _: never = file.type;
}

const getFilename = (hexo: Hexo, file: Hexo.Box.File) =>
  join(hexo.public_dir, "slide", file.params[1] + ".html");
