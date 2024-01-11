jest.mock("fs/promises", () => ({
  rm: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

import Hexo from "hexo";
import { revealProcessorCallback } from "../src/reveal.processor";
import fs from "fs/promises";
import { join } from "path";

describe("reveal.processor", () => {
  let hexo: Hexo;

  beforeEach(() => {
    hexo = new Hexo("/test");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("revealProcessorCallback", () => {
    describe("skip", () => {
      it("should do nothing", async () => {
        const file = {
          type: "skip",
          params: { "1": "foo" },
        } as Hexo.Box.File;

        await revealProcessorCallback.bind(hexo)(file);
      });
    });

    describe("delete", () => {
      it("should delete a file", async () => {
        const file = {
          type: "delete",
          params: { "1": "foo" },
        } as Hexo.Box.File;

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.rm).toHaveBeenCalledWith(
          "/" + join("test", "public", "slide", "foo.html")
        );
      });
    });

    describe("create / update", () => {
      it("should create the html containing markdown and config", async () => {
        const file = {
          type: "create",
          params: { "1": "path/to/slide" },
        } as Hexo.Box.File;

        hexo.config.reveal = {
          foo: "bar",
          baz: [42, 23]
        };

        file.read = jest.fn().mockResolvedValue("# This is a slide");
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(file).toEqual("/test/public/slide/path/to/slide.html");
          expect(data).toContain("# This is a slide");
          expect(data).toContain('...{"foo":"bar","baz":[42,23]},');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(file.read).toHaveBeenCalled();
        expect(fs.mkdir).toHaveBeenCalledWith("/test/public/slide/path/to", {
          recursive: true,
        });
        expect(fs.writeFile).toHaveBeenCalled();
      });
    });
  });
});
