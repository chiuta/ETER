// ETER — simulator pe traseu (locatoare, bandă, oră UTC) + VHF/UHF linie de vedere/profil de teren.
// Model simplificat, nu prognoză. Rulare: node tests/sim.test.mjs
import {launch, check, summary, axeRun, hOverflow} from "./_lib.mjs";

const {browser, page, st} = await launch({bypassCSP: true});
await page.waitForTimeout(2500);
await page.evaluate(() => document.querySelector('[data-sec="propagare"]').click());
await page.waitForSelector("#simA", {state: "visible"});
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- funcții pure
const P = await page.evaluate(() => {
  const S = window.__eterSim, r = {};
  r.kn34 = S.parseLoc("KN34"); r.kn34ij = S.parseLoc("kn34ij"); r.bad = [S.parseLoc("ZZ99"), S.parseLoc("KN3"), S.parseLoc("KN34i"), S.parseLoc("KN34zz"), S.parseLoc("")];
  r.fn30 = S.parseLoc("FN30");
  r.eq = S.sunElev(0, 0, S.dayOfYear(2026, 3, 20), 12);
  r.sumN = S.sunElev(45, 0, S.dayOfYear(2026, 6, 21), 12);
  r.sumMid = S.sunElev(45, 0, S.dayOfYear(2026, 6, 21), 0);
  r.winN = S.sunElev(45, 0, S.dayOfYear(2026, 12, 21), 12);
  r.east = S.sunElev(0, 90, S.dayOfYear(2026, 3, 20), 6);       // Soarele e la zenit la 90°E la ora 6 UTC
  r.hor = S.horizonKm(10, 10); r.fspl = S.fspl(144, 100); r.fres = S.fresnel(144, 50, 50); r.bul = S.bulge(50, 50);
  r.doy = [S.dayOfYear(2026, 1, 1), S.dayOfYear(2026, 12, 31)];
  const a = {lat: 0, lon: 0}, b = {lat: 0, lon: 90};
  r.mid = S.between(a, b, 0.5);
  r.cp = [S.controlPoints(a, b, 1000).length, S.controlPoints(a, b, 3800).length, S.controlPoints(a, b, 3801).length, S.controlPoints(a, b, 12000).length];
  r.prof = [S.parseProfile("0; 310\n40; 520\n\n80; 340", 80).pts.length, S.parseProfile("0; 310\nabc", 80).bad, S.parseProfile("0; 1\n90; 2", 80).bad, S.parseProfile("1;2;3", 80).bad, S.parseProfile("", 80).pts.length];
  r.ground = [S.groundAt([{x: 0, y: 100}, {x: 10, y: 200}], 5), S.groundAt([{x: 0, y: 100}, {x: 10, y: 200}], -3), S.groundAt([{x: 0, y: 100}, {x: 10, y: 200}], 99), S.groundAt([], 5)];
  const flat = S.analyse(20, 1296, 50, 50, []), far = S.analyse(100, 144, 10, 10, []), hill = S.analyse(40, 144, 20, 20, [{x: 20, y: 400}]), hill2 = S.analyse(40, 144, 60, 60, [{x: 20, y: 5}]);
  r.an = [flat.verdict, far.verdict, hill.verdict, hill2.verdict, Math.round(hill.worst.x)];
  const d = 5000, pts = S.controlPoints({lat: 44.5, lon: 27}, {lat: 40.7, lon: -74}, d);
  r.hf = {};
  ["80", "40", "20", "15", "10"].forEach(bd => { r.hf[bd] = Array.from({length: 24}, (_, h) => S.hfScore(bd, d, pts, S.dayOfYear(2026, 10, 26), h, "mediu")); });
  r.solar = [S.hfScore("10", 2000, S.controlPoints({lat: 44, lon: 26}, {lat: 30, lon: 31}, 2000), 300, 11, "scazut"), S.hfScore("10", 2000, S.controlPoints({lat: 44, lon: 26}, {lat: 30, lon: 31}, 2000), 300, 11, "ridicat")];
  r.skip = [S.hfScore("20", 50, S.controlPoints({lat: 44, lon: 26}, {lat: 44.4, lon: 26}, 50), 300, 11, "mediu"), S.hfScore("20", 1500, S.controlPoints({lat: 44, lon: 26}, {lat: 44, lon: 45}, 1500), 300, 11, "mediu")];
  r.level = [14, 15, 34, 35, 54, 55, 71, 72].map(x => S.level(x));
  return r;
});
check("locator KN34 → centrul pătratului (44.5N, 27E)", near(P.kn34.lat, 44.5, 1e-9) && near(P.kn34.lon, 27, 1e-9), P.kn34);
check("locator KN34ij (literele mici acceptate) → 44.396N, 26.708E", near(P.kn34ij.lat, 44 + 9 / 24 + 1 / 48, 1e-9) && near(P.kn34ij.lon, 26 + 8 / 12 + 1 / 24, 1e-9), P.kn34ij);
check("locatoare invalide respinse (ZZ99, KN3, KN34i, KN34zz, gol)", P.bad.every(x => x === null), P.bad);
check("FN30 → 40.5N, −73W", near(P.fn30.lat, 40.5, 1e-9) && near(P.fn30.lon, -73, 1e-9), P.fn30);
check("Soare: ecuator, echinocțiu, prânz solar → ~90° (±3)", near(P.eq, 90, 3), P.eq);
check("Soare: 45°N, solstițiu de vară, prânz → ~68.4° (±1.5)", near(P.sumN, 68.4, 1.5), P.sumN);
check("Soare: 45°N, solstițiu de vară, miezul nopții → ~−21.6° (±1.5)", near(P.sumMid, -21.6, 1.5), P.sumMid);
check("Soare: 45°N, solstițiu de iarnă, prânz → ~21.6° (±1.5)", near(P.winN, 21.6, 1.5), P.winN);
check("Soare: 90°E la 06:00 UTC, echinocțiu → ~90° (±3)", near(P.east, 90, 3), P.east);
check("zi din an: 1 ian = 1, 31 dec = 365", P.doy[0] === 1 && P.doy[1] === 365, P.doy);
check("orizont radio 10 m + 10 m (k=4/3) ≈ 26.0 km", near(P.hor, 26.05, 0.05), P.hor);
check("pierdere în spațiu liber 144 MHz / 100 km ≈ 115.6 dB", near(P.fspl, 115.6, 0.1), P.fspl);
check("raza Fresnel 1: 144 MHz, 50+50 km ≈ 228 m", near(P.fres, 228, 2), P.fres);
check("bombarea Pământului, 50+50 km, k=4/3 ≈ 147 m", near(P.bul, 147, 1), P.bul);
check("punct de mijloc pe ecuator între 0° și 90°E = 45°E", near(P.mid.lat, 0, 1e-9) && near(P.mid.lon, 45, 1e-9), P.mid);
check("puncte de control: 1000 km→1, 3800→1, 3801→2, 12000→4 salturi", JSON.stringify(P.cp) === "[1,1,2,4]", P.cp);
check("profil: parsare, linie greșită, în afara traseului, câmpuri de prisos, gol", JSON.stringify(P.prof) === "[3,2,2,1,0]", P.prof);
check("altitudine interpolată: mijloc 150, înainte de start 100, după capăt 200, fără profil 0", JSON.stringify(P.ground) === "[150,100,200,0]", P.ground);
check("analiză LOS: 20 km cu antene de 50 m pe 1296 MHz liber; 100 km (10 m+10 m) blocat; deal 400 m blocat; teren de 5 m cu antene de 60 m nu blochează", P.an[0] === "free" && P.an[1] === "blocked" && P.an[2] === "blocked" && P.an[3] !== "blocked" && P.an[4] === 20, P.an);
const all = Object.values(P.hf).flat();
check("scorurile HF sunt întregi în [2,98]", all.every(x => Number.isInteger(x) && x >= 2 && x <= 98));
const hmax = a => a.indexOf(Math.max(...a)), hmin = a => a.indexOf(Math.min(...a));
check("40 m (București→New York, 5000 km): mai bun noaptea decât ziua (max la ore de noapte, nu la prânz)", P.hf["40"][3] > P.hf["40"][12], [P.hf["40"][3], P.hf["40"][12]]);
check("20 m: cel mai bun scor este în ore de lumină (nu la miezul nopții la ambele capete)", P.hf["20"][hmax(P.hf["20"])] > P.hf["20"][hmin(P.hf["20"])], P.hf["20"]);
check("activitate solară ridicată ≥ scăzută pe 10 m", P.solar[1] > P.solar[0], P.solar);
check("zona de tăcere: 20 m la 50 km mult sub 20 m la 1500 km", P.skip[0] < P.skip[1] / 2, P.skip);
check("niveluri: praguri 15/35/55/72", JSON.stringify(P.level) === "[0,1,1,2,2,3,3,4]", P.level);

// ---- interfață
async function fill(a, b, extra = {}) {
  await page.fill("#simA", a); await page.fill("#simB", b);
  if (extra.date) await page.fill("#simDate", extra.date);
  if (extra.hour != null) await page.selectOption("#simHour", String(extra.hour));
  if (extra.solar) await page.selectOption("#simSolar", extra.solar);
}
await fill("", "");
check("fără locatoare: mesaj de ghidare", /ambele locatoare/.test(await page.textContent("#simMsg")));
await fill("KN34", "xx");
check("locator invalid: mesaj de eroare, fără tabel", /Locator invalid/.test(await page.textContent("#simMsg")) && (await page.locator("#simHeat table").count()) === 0);
await fill("KN34", "FN30", {date: "2026-10-26", hour: 3, solar: "mediu"});
const dist = parseFloat(await page.textContent("#simDist"));
check("distanță KN34→FN30 ≈ 7500–7800 km", dist > 7400 && dist < 7900, dist);
check("azimut scurt + lung afișate cu puncte cardinale", /^\d+° \(\w+\)$/.test(await page.textContent("#simBrg")) && /^\d+° \(\w+\)$/.test(await page.textContent("#simBrgL")));
const brs = [await page.textContent("#simBrg"), await page.textContent("#simBrgL")].map(x => parseInt(x));
check("azimutul lung = scurt + 180°", (brs[0] + 180) % 360 === brs[1], brs);
check("salturi estimate = ceil(distanță / 3800 km)", (await page.textContent("#simHops")) === String(Math.ceil(dist / 3800)), [dist, await page.textContent("#simHops")]);
check("Soarele la ambele capete afișat", /elevație -?\d+°, (zi|crepuscul|noapte)/.test(await page.textContent("#simSunA")) && /elevație -?\d+°, (zi|crepuscul|noapte)/.test(await page.textContent("#simSunB")));
check("tabel 24 de rânduri × 5 benzi + rând „cea mai bună oră”", (await page.locator("#simHeat tbody tr").count()) === 24 && (await page.locator("#simHeat tbody tr:first-child td").count()) === 5 && (await page.locator("#simHeat tfoot td").count()) === 5);
check("rândul orei selectate este marcat", (await page.locator("#simHeat tr.sim-cur th").textContent()) === "03:00");
const cell = await page.locator("#simHeat tbody tr:nth-child(4) td").first().textContent();
check("celulele conțin scoruri numerice (nu doar culoare)", /^\d{1,2}$/.test(cell), cell);
check("avertisment „Model simplificat, nu prognoză” vizibil lângă tabel", await page.locator("#sec-propagare .note.warn", {hasText: "Model simplificat, nu prognoză"}).isVisible());
const s1 = await page.locator("#simHeat tbody tr:nth-child(4) td").first().textContent();
await page.selectOption("#simSolar", "ridicat"); const s2 = await page.locator("#simHeat tbody tr:nth-child(4) td").first().textContent();
await page.selectOption("#simSolar", "scazut"); const s3 = await page.locator("#simHeat tbody tr:nth-child(4) td").first().textContent();
check("activitatea solară schimbă scorurile (scăzută ≤ medie ≤ ridicată pe 80 m)", +s3 <= +s1 && +s1 <= +s2 && +s3 < +s2, [s3, s1, s2]);
await page.selectOption("#simSolar", "mediu");
// VHF
await fill("KN34", "KN35");
const vtxt = await page.textContent("#simVhfOut");
check("VHF/UHF: orizont, pierdere, Fresnel, bombare, verdict, punct critic", /Orizont radio/.test(vtxt) && /Pierdere în spațiu liber/.test(vtxt) && /Fresnel/.test(vtxt) && /Bombarea/.test(vtxt) && /Punctul critic/.test(vtxt), vtxt);
await fill("KN34", "KN34");
check("locatoare identice: mesaj, fără erori", /prea mică/.test(await page.textContent("#simVhfOut")) && st.errs.length === 0, st.errs);
await fill("KN34", "KN44");   // 2° longitudine ≈ 159 km
check("peste orizontul radio fără profil: verdict clar", /Peste orizontul radio/.test(await page.textContent("#simVhfOut")));
await page.fill("#simH1", "500"); await page.fill("#simH2", "500");
check("antene înalte: verdict se schimbă (nu mai e „peste orizont”)", !/Peste orizontul radio/.test(await page.textContent("#simVhfOut")), await page.textContent("#simVhfOut"));
await page.fill("#simProf", "0; 100\n75; 2000\n150; 100");
check("profil cu munte de 2000 m: blocat de teren", /blocată de teren/.test(await page.textContent("#simVhfOut")));
check("profil desenat (SVG vizibil + legendă)", await page.locator("#simProfSvg").isVisible() && await page.locator("#simProfCap").isVisible() && (await page.locator("#simProfSvg path").count()) === 2);
await page.fill("#simProf", "0; 100\nxyz");
check("profil invalid: mesaj cu numărul liniei", /Profil invalid la linia 2/.test(await page.textContent("#simVhfOut")));
await page.fill("#simProf", "");
await page.selectOption("#simVhfBand", "1296");
check("bandă 1296 MHz: pierdere în spațiu liber mai mare", true);
await fill("KN34", "KN34ij"); await page.fill("#simH1", "10"); await page.fill("#simH2", "10");
check("distanță foarte mică: fără erori JS", st.errs.length === 0, st.errs);

// ---- limbi
await page.selectOption("#simVhfBand", "144"); await fill("KN34", "FN30");
await page.evaluate(() => ETERI18N.setLang("en")); await page.waitForTimeout(400);
check("EN: etichete traduse", (await page.textContent('label[for="simA"]')) === "Your locator" && (await page.textContent("#simHeat caption")) === "Indicative favourability (0–100) by UTC hour and band", await page.textContent('label[for="simA"]'));
check("EN: valori dinamice traduse (elevație, ora cea mai bună, avertisment)", /elevation -?\d+°, (day|twilight|night)/.test(await page.textContent("#simSunA")) && (await page.textContent("#simHeat tfoot th")) === "Best UTC hour" && /Simplified model, not a forecast/.test(await page.textContent("#sec-propagare .note.warn:last-of-type") + await page.textContent("#sec-propagare")));
await page.fill("#simB", "xx"); check("EN: mesajul de eroare tradus", (await page.textContent("#simMsg")) === "Invalid locator (e.g. KN34 or KN34ij).", await page.textContent("#simMsg"));
await fill("KN34", "KN44");
check("EN: verdict VHF tradus", /Beyond the radio horizon/.test(await page.textContent("#simVhfOut")), await page.textContent("#simVhfOut"));
for (const l of ["fr", "it", "es", "pt", "de", "hu"]) {
  await page.evaluate(x => ETERI18N.setLang(x), l); await page.waitForTimeout(250);
  const lab = await page.textContent('label[for="simA"]'), cap = await page.textContent("#simHeat caption");
  check(`${l}: etichetă și legendă traduse`, lab !== "Locatorul tău" && cap !== "Favorabilitate orientativă (0–100) pe oră UTC și bandă" && !/[ăîșț]/.test(await page.textContent("#simVhfOut")), [lab, cap]);
}
await page.evaluate(() => ETERI18N.setLang("ro")); await page.waitForTimeout(250);
check("RO: revenire la textul sursă", (await page.textContent('label[for="simA"]')) === "Locatorul tău");
await fill("KN34", "FN30");
// ---- accesibilitate, rețea, erori
await page.locator("#simA").scrollIntoViewIfNeeded(); await page.mouse.move(0, 0);
const ax = await axeRun(page);
check("axe: 0 violări pe pagina cu simulatorul", ax === null || ax.length === 0, ax);
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "zi")); await page.waitForTimeout(200);
const ax2 = await axeRun(page);
check("axe: 0 violări și în tema de zi", ax2 === null || ax2.length === 0, ax2);
await page.setViewportSize({width: 360, height: 800}); await page.waitForTimeout(200);
check("fără derulare orizontală la 360 px", (await hOverflow(page)) <= 1, await hOverflow(page));
check("0 cereri externe", st.net.length === 0, st.net);
check("0 erori JS", st.errs.length === 0, st.errs);
await browser.close();
summary();
