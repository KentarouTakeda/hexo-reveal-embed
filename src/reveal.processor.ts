import type Hexo from "hexo";

type T = Parameters<Hexo.extend.Processor["register"]>[0];

export const revealProcessorCallback: T = ({ type, path }) => {
  if (type === "skip") {
    return;
  }

  if (type === "delete") {
    deleteFile(path);
    return;
  }

  if (type === "update" || type === "create") {
    createFile(path);
    return;
  }

  const _: never = type;
};

const deleteFile = (file: string) => {};

const createFile = (file: string) => {};
