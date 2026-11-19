# Jurnal de modificări — ETER

## 5.4.3 — 2026-11-20

- fff-kit 1.8.1: când `localStorage`/`sessionStorage` aruncă sau lipsesc (cookie-uri și date de site blocate, WebView fără stocare, `<iframe sandbox>`), kitul pune în loc o stocare în memorie, iar pagina pornește în loc să se oprească; datele nu se păstrează după închiderea paginii
- fff-kit 1.8.1: ghidajul care mărește controalele mici la 44 px măsoară acum și lățimea corpului paginii și a părintelui, deci un rând de butoane nu mai poate ieși din ecran (grupul rămâne neatins când mărirea l-ar depăși)

## 5.4.2 — 2026-11-17

- Compatibilitate cu browsere mai vechi (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kitul 1.8.0 aduce stratul de compatibilitate (rezerve pentru API-urile care lipsesc în motoarele vechi), iar sintaxa JavaScript mai nouă decât ES2017 a fost înlocuită cu forme echivalente acolo unde exista; expresiile regulate noi și `import()` trec prin rezerve. Fără modificări de funcționalitate intenționate. Verificat cu parser ES2017 și într-un motor vechi simulat, nu pe dispozitive reale.

## 5.4.1 — 2026-11-15

- Nou: butoane de distribuire pe rețele sociale (vertical, pe marginea din stânga; fără scripturi externe, doar linkuri deschise la clic); bara de zoom cu lupă și „potrivire ecran” revine pe marginea din dreapta, centrată pe verticală; corectat afișarea suprapusă la zoom mare (panourile cu înălțimi în vh/vw nu mai ies din ecran).

## 5.4.0 — 2026-11-15

- Nou: accesibilitate pe toate ecranele — butonul „Aa” (mărimea textului, contrast ridicat, fără animații, text lizibil, linkuri subliniate, citire cu voce), săgeata „Înapoi sus” și „Sari la conținut”; fereastra se potrivește mereu ecranului; zoom-ul cu lupă și „potrivire ecran” stau acum pe marginea din stânga (fff-kit 1.6.0).

## 5.3.10 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 5.3.5 — 2026-11-08
Calculatorul de lungimi: exemplu rezolvat sub tabel («Dipol λ/2 la 14,200 MHz: 142,65 / 14,2 ≈ 10,05 m în total, ≈ 5,02 m pe fiecare braț»), tradus în 8 limbi (2 chei noi în dicționarul i18n). Unitatea (m) era deja afișată în fiecare rezultat.

## 5.3.2 — 2026-11-03

Destinații «Trimite către…» pentru pașaportul de învățare: adăugate FENARIUM și MENSURA (registrul de aplicații-țintă reinjectat din hub).

## 5.3.1 — 2026-11-03

Pașaport de învățare comun (FFF): „Notează în pașaport”, repetări eșalonate, export/import passport/fff și certificat tipărabil auto-declarat; local, fără server.

## 5.3.0 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 5.3.0 — 2026-11-01

- Corectat: adaptorul «Trimite la…» nu mai aruncă eroare când kitul FFF lipsește (gardian pe fiecare bloc; găsit de testul «fără kit» din CI).

Nou: «Trimite la…» (fff-kit, modulul FFF.bridge) — testul de cunoștințe poate fi trimis către Undava ca quiz (plic .fff.json, cu confirmare înainte de import). Fără rețea, fără telemetrie.

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
