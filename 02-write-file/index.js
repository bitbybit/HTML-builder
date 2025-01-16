const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const readline = require('node:readline');

const write = async () => {
  const file = await fs.open(path.resolve(`${__dirname}/text.txt`), 'w');

  const stream = file.createWriteStream();

  const rl = readline.createInterface({
    input: process.stdin,
    output: stream,
  });

  process.stdout.write(`Enter text: ${os.EOL}`);

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      if (line === 'exit') {
        rl.close();
      } else {
        stream.write(line);
      }
    });

    rl.on('close', () => {
      stream.end();
      process.stdout.write(`Good bye!${os.EOL}`);
      resolve();
    });

    process.on('SIGINT', () => rl.close());
  });
};

write();
