const fs = require('node:fs/promises');
const path = require('node:path');

const pathToDest = `${__dirname}/project-dist`;

const buildHtml = async () => {
  await fs.mkdir(path.resolve(pathToDest), {
    recursive: true,
  });

  let template = await fs.readFile(path.resolve(`${__dirname}/template.html`), {
    encoding: 'utf8',
  });

  const components = template.matchAll(/{{(.+)}}/g);

  await Promise.all(
    components.map(async ([componentVariable, componentName]) => {
      const componentFile = await fs.open(
        path.resolve(`${__dirname}/components/${componentName}.html`),
        'r',
      );

      const componentStream = componentFile.createReadStream();

      return new Promise((resolve) => {
        let componentHtml = '';

        componentStream.on('data', (chunk) => {
          componentHtml += chunk.toString();
        });

        componentStream.on('end', () => {
          componentStream.close();
          template = template.replace(componentVariable, componentHtml);
          resolve();
        });
      });
    }),
  );

  const destFile = await fs.open(path.resolve(`${pathToDest}/index.html`), 'w');

  const destStream = destFile.createWriteStream();

  destStream.write(template);
  destStream.close();
};

const mergeCss = async () => {
  const pathToSrc = `${__dirname}/styles`;

  const srcDirectory = await fs.readdir(path.resolve(pathToSrc), {
    withFileTypes: true,
  });

  await fs.rm(path.resolve(`${pathToDest}/style.css`), { force: true });

  const bundleFile = await fs.open(
    path.resolve(`${pathToDest}/style.css`),
    'w',
  );

  const bundleStream = bundleFile.createWriteStream();

  await Promise.all(
    srcDirectory.map(async (file) => {
      const extname = path.extname(file.name);
      const isCssFile = !file.isDirectory() && extname.endsWith('.css');

      if (isCssFile) {
        const cssFile = await fs.open(
          path.resolve(`${pathToSrc}/${file.name}`),
          'r',
        );

        const cssStream = cssFile.createReadStream();

        return new Promise((resolve) => {
          cssStream.on('data', (chunk) => {
            bundleStream.write(chunk);
          });

          cssStream.on('end', () => {
            cssStream.close();
            resolve();
          });
        });
      }
    }),
  );

  bundleStream.close();
};

const copyAssets = async (
  pathToSrcRecursive = `${__dirname}/assets`,
  pathToDestRecursive = `${pathToDest}/assets`,
) => {
  await fs.mkdir(path.resolve(pathToDestRecursive), {
    recursive: true,
  });

  const destDirectory = await fs.readdir(path.resolve(pathToDestRecursive));

  for (const item of destDirectory) {
    await fs.rm(path.resolve(`${pathToDest}/${item}`), {
      recursive: true,
      force: true,
    });
  }

  const srcDirectory = await fs.readdir(path.resolve(pathToSrcRecursive), {
    withFileTypes: true,
  });

  await Promise.all(
    srcDirectory.map(async (item) => {
      const pathToSrcItem = path.resolve(
        path.join(pathToSrcRecursive, item.name),
      );
      const pathToDestItem = path.resolve(
        path.join(pathToDestRecursive, item.name),
      );

      if (item.isDirectory()) {
        await copyAssets(pathToSrcItem, pathToDestItem);
      } else {
        await fs.copyFile(pathToSrcItem, pathToDestItem);
      }
    }),
  );
};

buildHtml().then(mergeCss).then(copyAssets);
