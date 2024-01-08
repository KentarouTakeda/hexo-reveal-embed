import type Hexo from "hexo";

type T = Parameters<Hexo.extend.Tag["register"]>[1];

export const revealTagCallback: T = (args, content) => {
  return "";
};
