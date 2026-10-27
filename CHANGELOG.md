# Jurnal de modificări — ETER

## 5.2.0 — 2026-10-27 (anterior: 5.1.0)
- Test nou `tests/links.test.mjs` (audit static): toate legăturile externe se deschid doar la clic, în filă nouă, cu `rel=noopener`; niciun script nu face cereri http(s); CSP strict păstrat.
- README: notă scurtă în cele 6 limbi rămase (traducere automată, neverificată nativ) despre legături, vibrația Morse și lipsa partajării de date.
- Rulat `tests/fff-r8.test.mjs`: 57 reușite, 0 eșuate (durează aproape 8 minute în sandbox; în 5.1.0 depășise timpul).
- Neimplementat: partajare de date între aplicații (contrazice „fără server”); verificarea adreselor INDICATIV/QSO (rețea blocată); test pe telefoane reale pentru vibrație.

## 5.1.0 — 2026-10-27 (anterior: 5.0.0)
- Nou: bloc „Ecosistemul radio fără frontiere” pe pagina Acasă și rânduri „vezi și” în §13 (spre QSO) și §17 (spre INDICATIV); linkuri externe doar la clic, `target=_blank rel=noopener`, fără cereri de rețea din aplicație. Adresele `https://chiuta.github.io/INDICATIV/` și `https://chiuta.github.io/apps/QSO/` sunt luate din README-urile aplicațiilor surori și NU au fost verificate (de verificat).
- Nou: notă vizibilă lângă „📳 vibrează” (Morse prin vibrație): apare doar în browsere cu Vibration API (de obicei Android + Chrome; nu iPhone/iPad). Funcția în sine exista deja (traducător + runde Koch). Netestată pe telefoane reale.
- 7 texte noi traduse în cele 7 limbi non-române (automat, neverificat nativ), adăugate la dicționarul `eter-i18n`.
- „Stare: stabil” și „Offline: complet” în cele 8 README.
- Neimplementat: partajare de date între aplicații (QSO ↔ ETER ↔ INDICATIV): ar încălca izolarea „fără server, fără cont”; un schimb prin fișier ar fi un proiect separat.
