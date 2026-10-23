// ETER — regresie: cardurile SRS importate (JSON) sunt curățate; câmpuri lipsă/Infinity nu produc NaN la revizuire.
// Rulare: node tests/srs-import.test.mjs
import fs from "fs";
import os from "os";
import path from "path";
import {launch, check, summary} from "./_lib.mjs";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "eter-srs-"));
const f = path.join(tmp, "srs.json");
// 1e999 e valid în JSON.parse (→ Infinity); celelalte carduri au câmpuri lipsă
fs.writeFileSync(f, '{"eter_srs":{"a":{"interval":1,"dueDate":1},"b":{"interval":1e999,"dueDate":1e999,"repetitions":1e999,"easeFactor":-5},"__proto__":{"interval":1,"dueDate":1}}}');
const {browser, page, st} = await launch();
await page.waitForTimeout(3000);
await page.setInputFiles("#srsImportFile", f);
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector("#srsExportBtn").scrollIntoView());
const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => document.querySelector("#srsExportBtn").click())]);
const out = JSON.parse(fs.readFileSync(await dl.path(), "utf8")).eter_srs;
const cards = Object.values(out), KEYS = ["interval", "easeFactor", "repetitions", "dueDate"];
check("2 carduri importate, __proto__ ignorat", cards.length === 2, Object.keys(out));
check("toate câmpurile numerice sunt finite după import (exportul nu conține null)", cards.every(c => KEYS.every(k => Number.isFinite(c[k]))), out);
check("easeFactor limitat la ≥1.3", cards.every(c => c.easeFactor >= 1.3));
check("Object.prototype nepoluat", await page.evaluate(() => ({}).interval === undefined));
check("0 erori", st.errs.length === 0, st.errs);
await browser.close();
summary();
