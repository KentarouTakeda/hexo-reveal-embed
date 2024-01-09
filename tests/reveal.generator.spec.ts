jest.mock("fs", () => ({
  createReadStream: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  realpathSync: jest.fn().mockReturnValue('/test'),
}));

jest.mock("glob", () => ({
  globSync: jest.fn(),
}));

import fs from "fs";
import glob from "glob";
import {revealGeneratorCallback} from "../src/reveal.generator";

describe("reveal.generator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate glob of specified file', ()=>{
    glob.globSync = jest.fn().mockReturnValue(['/test/foo', '/test/bar/baz']);

    const result = revealGeneratorCallback();
    result.map((item) => item.data());

    expect(fs.realpathSync).toHaveBeenCalled();
    expect(fs.createReadStream).toHaveBeenCalledWith('/test/foo');
    expect(fs.createReadStream).toHaveBeenCalledWith('/test/bar/baz');
  });
});;
