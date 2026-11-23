const { cp, mkdir, rm } = require("node:fs/promises");
const path = require("node:path");

const projectDirectory = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectDirectory, "dist");
const publicFiles = ["index.html", "styles.css", "src/app.js", "src/tasks.js"];

async function build() {
  await rm(outputDirectory, { recursive: true, force: true });

  for (const relativePath of publicFiles) {
    const destination = path.join(outputDirectory, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(projectDirectory, relativePath), destination);
  }

  console.log(`TaskFlow compilado en ${outputDirectory}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
