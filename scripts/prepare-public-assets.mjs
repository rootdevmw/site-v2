import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "public", "images");
await mkdir(output, { recursive: true });

// Keep the original congregation photographs; create smaller web assets.
for (const [source, name, width, quality] of [
  ["IMGL8976.jpg", "worship.webp", 1600, 78],
  ["IMGL7896.jpg", "welcome.webp", 1100, 78],
  ["IMGL7930.jpg", "community.webp", 1100, 78],
  ["logos/round.png", "church-logo.webp", 160, 90],
]) {
  const info = await sharp(path.join(root, "public", source))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(path.join(output, name));
  process.stdout.write(`${name}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB\n`);
}
