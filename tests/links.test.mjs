// Audit static al legăturilor externe (fără browser): toate se deschid doar la clic, în filă nouă, cu rel=noopener.
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
const html = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "index.html"), "utf8");
let fails = 0, n = 0;
const ok = (name, c, x) => { if (c) console.log("  ok  " + name); else { fails++; console.log("FAIL  " + name + (x ? "  -> " + x : "")); } };
const anchors = [...html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*>/g)];
for (const m of anchors) {
  n++;
  const tag = m[0];
  ok("ancoră externă " + m[1].slice(0, 60) + ": target=_blank + rel=noopener", /target="_blank"/.test(tag) && /rel="[^"]*noopener/.test(tag), tag.slice(0, 160));
}
ok("există legături externe auditate", n >= 8, n);
ok("legăturile către aplicațiile surori (INDICATIV, QSO) sunt prezente", html.includes("chiuta.github.io/INDICATIV/") && html.includes("chiuta.github.io/apps/QSO/"));
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
ok("scripturile nu folosesc fetch/XMLHttpRequest/sendBeacon către http(s)", !/fetch\(\s*['"`]https?:/.test(scripts) && !/XMLHttpRequest|sendBeacon/.test(scripts));
ok("CSP interzice conexiuni (connect-src 'none' sau default-src 'none' fără connect-src extern)", /default-src 'none'/.test(html) && !/connect-src[^;"]*https?:/.test(html));
console.log(`\n${n} ancore, ${fails} eșuate`);
process.exit(fails ? 1 : 0);
