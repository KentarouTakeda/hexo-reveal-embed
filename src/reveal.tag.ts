import type Hexo from 'hexo';
import { htmlTag } from 'hexo-util';

type T = Parameters<Hexo.extend.Tag['register']>[1];

export const revealTagCallback: T = ([name]) =>
  htmlTag(
    'div',
    { class: 'hexo-reveal-embed' },
    htmlTag(
      'iframe',
      {
        src: name.endsWith('/') ? `/slide/${name}` : `/slide/${name}.html`,
        allowfullscreen: true,
        loading: 'lazy',
      },
      '',
    ),
    false,
  );
