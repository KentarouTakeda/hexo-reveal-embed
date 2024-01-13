jest.mock('fs/promises', () => ({
  rm: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

import fs from 'fs/promises';
import Hexo from 'hexo';
import { revealProcessorCallback } from '../src/reveal.processor';

describe('reveal.processor', () => {
  let hexo: Hexo;

  const file = {
    type: 'create',
    params: { name: 'path/to/slide', ext: 'md' },
  } as Hexo.Box.File;

  beforeEach(() => {
    hexo = new Hexo('/test');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('revealProcessorCallback', () => {
    describe('skip', () => {
      it('should do nothing', async () => {
        await revealProcessorCallback.bind(hexo)({ ...file, type: 'skip' });
      });
    });

    describe('delete', () => {
      it('should delete a file', async () => {
        await revealProcessorCallback.bind(hexo)({ ...file, type: 'delete' });

        expect(fs.rm).toHaveBeenCalledWith(
          '/test/public/slide/path/to/slide.html',
        );
      });
    });

    describe('create / update', () => {
      it('should create the html containing markdown and config', async () => {
        hexo.config.reveal = {
          config: {
            foo: 'bar',
            baz: [42, 23],
          },
        };

        file.read = jest.fn().mockResolvedValue('# This is a slide');
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(file).toEqual('/test/public/slide/path/to/slide.html');
          expect(data).toContain('# This is a slide');
          expect(data).toContain('...{"foo":"bar","baz":[42,23]},');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(file.read).toHaveBeenCalled();
        expect(fs.mkdir).toHaveBeenCalledWith('/test/public/slide/path/to', {
          recursive: true,
        });
        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should create html even if config is not specified', async () => {
        file.read = jest.fn().mockResolvedValue('# This is a slide');
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('...{},');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load plugins if specified', async () => {
        hexo.config.reveal = {
          plugins: ['RevealMarkdown', 'RevealHighlight', 'RevealNotes'],
        };

        file.read = jest.fn().mockResolvedValue('# This is a slide');
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain(
            'plugins: [RevealMarkdown, RevealHighlight, RevealNotes]',
          );
          expect(data).toContain(
            '<script src="/reveal.js/plugin/notes/notes.js"></script>',
          );
          expect(data).toContain(
            '<script src="/reveal.js/plugin/markdown/markdown.js"></script>',
          );
          expect(data).toContain(
            '<script src="/reveal.js/plugin/highlight/highlight.js"></script>',
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load only markdown plugin if not specified', async () => {
        file.read = jest.fn().mockResolvedValue('# This is a slide');
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('plugins: [RevealMarkdown]');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should throw an error if unknown plugin name is specified', async () => {
        hexo.config.reveal = {
          plugins: ['Foo'],
        };

        file.read = jest.fn().mockResolvedValue('# This is a slide');

        await expect(revealProcessorCallback.bind(hexo)(file)).rejects.toThrow(
          'Invalid plugin name: Foo',
        );
      });
    });
  });
});
