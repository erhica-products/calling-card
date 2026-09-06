// Builds the static GitHub Pages site into docs/ from the same profile,
// template and stylesheet the Express app serves — so the hosted card and the
// running server never drift.
//
//   npm run build:static
//
// Output:
//   docs/index.html   self-contained card (CSS, Good Sans and logos inlined)
//   docs/<name>.vcf   the downloadable contact file
//   docs/.nojekyll    stops GitHub Pages running the files through Jekyll
//
// Only data/profile.json is read, never data/profile.local.json — the site is
// public, so personal contact details must not reach it.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderCard } from "../src/lib/render.js";
import { buildVCard, vcardFilename } from "../src/lib/vcard.js";

const root = new URL("../", import.meta.url);
const asset = (p) => new URL(p, root);

async function dataUri(path, mime) {
  const bytes = await readFile(asset(path));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function main() {
  const profile = JSON.parse(await readFile(asset("data/profile.json"), "utf8"));
  profile.roles = Array.isArray(profile.roles) ? profile.roles : [];
  profile.links = Array.isArray(profile.links) ? profile.links : [];

  // Inline the stylesheet, swapping each @font-face src for a data URI.
  let css = await readFile(asset("public/styles.css"), "utf8");
  for (const file of ["GoodSans-Light.otf", "GoodSans-Regular.otf", "GoodSans-Medium.otf"]) {
    const uri = await dataUri(`public/fonts/${file}`, "font/otf");
    css = css.replaceAll(`url("/fonts/${file}")`, `url(${uri})`);
  }

  const logo = await dataUri("public/img/logo-horizontal.png", "image/png");
  const mark = await dataUri("public/img/logo-mark.png", "image/png");
  const vcfName = vcardFilename(profile);

  const html = (await renderCard(profile))
    .replace('<link rel="stylesheet" href="/styles.css" />', `<style>\n${css}\n</style>`)
    .replace('src="/img/logo-horizontal.png"', `src="${logo}"`)
    .replace('href="/img/logo-mark.png"', `href="${mark}"`)
    // On Pages there is no /vcard route — serve the file next to the page.
    .replace('href="/vcard"', `href="${vcfName}" download`);

  const out = new URL("docs/", root);
  await mkdir(out, { recursive: true });
  await writeFile(new URL("index.html", out), html);
  await writeFile(new URL(vcfName, out), buildVCard(profile));
  await writeFile(new URL(".nojekyll", out), "");

  console.log(`docs/index.html  ${(html.length / 1024).toFixed(0)} KB`);
  console.log(`docs/${vcfName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
