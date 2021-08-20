import tar from "tar";
import fs from "fs";
import path from "path";

export function createTar(Path) {
  if (!fs.existsSync(Path)) {
    console.log("Folder does not exist at", path.join(process.cwd(), Path));
    process.exit();
  }

  return tar.c(
    {
      gzip: true,
    },
    [Path]
  );
}

export function extractTar(Path) {
  if (!fs.existsSync(Path)) {
    fs.mkdirSync(Path);
  }

  return tar.x({
    strip: 1,
    C: Path,
  });
}
