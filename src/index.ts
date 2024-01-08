import { revealProcessorCallback } from "./reveal.processor";
import { revealTagCallback } from "./reveal.tag";

hexo.extend.tag.register("reveal", revealTagCallback);
hexo.extend.processor.register("slides/*.md", revealProcessorCallback);
