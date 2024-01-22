import assert from 'assert';

export const getMyVersion = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require(__dirname + '/../package.json');
  assert(typeof version === 'string');

  return version;
};
