const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const list = async () => {
  const pathToDirectory = `${__dirname}/secret-folder`;

  const files = await fs.readdir(path.resolve(pathToDirectory), {
    withFileTypes: true,
  });

  const result = await Promise.all(
    files
      .filter((file) => !file.isDirectory())
      .map(async (file) => {
        const extname = path.extname(file.name);
        const basename = path.basename(file.name, extname);

        const { size } = await fs.stat(
          path.resolve(`${pathToDirectory}/${file.name}`),
        );

        return `${basename} - ${extname.slice(1)} - ${size}${os.EOL}`;
      }),
  );

  process.stdout.write(result.join(''));
};

list();
