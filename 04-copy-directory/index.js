const fs = require('node:fs/promises');
const path = require('node:path');

const copyDir = async () => {
  const pathToSrc = `${__dirname}/files`;
  const pathToDest = `${__dirname}/files-copy`;

  await fs.mkdir(path.resolve(pathToDest), {
    recursive: true,
  });

  const srcDirectory = await fs.readdir(path.resolve(pathToSrc));
  const destDirectory = await fs.readdir(path.resolve(pathToDest));

  for (const file of destDirectory) {
    await fs.rm(path.resolve(`${pathToDest}/${file}`));
  }

  for (const file of srcDirectory) {
    await fs.copyFile(
      path.resolve(`${pathToSrc}/${file}`),
      path.resolve(`${pathToDest}/${file}`),
    );
  }
};

copyDir();
