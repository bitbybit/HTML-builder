const fs = require('node:fs/promises');
const path = require('node:path');

const merge = async () => {
  const pathToSrc = `${__dirname}/styles`;
  const pathToDest = `${__dirname}/project-dist`;

  const srcDirectory = await fs.readdir(path.resolve(pathToSrc), {
    withFileTypes: true,
  });

  await fs.rm(path.resolve(`${pathToDest}/bundle.css`), { force: true });

  const bundleFile = await fs.open(
    path.resolve(`${pathToDest}/bundle.css`),
    'w',
  );

  const writeStream = bundleFile.createWriteStream();

  await Promise.all(
    srcDirectory.map(async (cssFile) => {
      const extname = path.extname(cssFile.name);
      const isCssFile = !cssFile.isDirectory() && extname.endsWith('.css');

      if (isCssFile) {
        const readFile = await fs.open(
          path.resolve(`${pathToSrc}/${cssFile.name}`),
          'r',
        );

        const readStream = readFile.createReadStream();

        return new Promise((resolve) => {
          readStream.on('data', (chunk) => {
            writeStream.write(chunk);
          });

          readStream.on('end', () => {
            readStream.close();
            resolve();
          });
        });
      }
    }),
  );

  writeStream.close();
};

merge();
