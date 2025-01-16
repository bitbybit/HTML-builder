const fs = require('node:fs/promises');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const read = async () => {
  const file = await fs.open(path.resolve(`${__dirname}/text.txt`), 'r');

  const stream = file.createReadStream();

  await pipeline(stream, process.stdout);
};

read();
