import { revealGeneratorCallback } from './reveal.generator';
import { revealProcessorCallback } from './reveal.processor';
import { revealTagCallback } from './reveal.tag';

hexo.extend.tag.register('reveal', revealTagCallback);
hexo.extend.processor.register('slides/*name.*ext', revealProcessorCallback);
hexo.extend.generator.register('reveal', revealGeneratorCallback);
