# matekOpera

Nyilvános, bejelentkezés nélkül használható alkalmazás: https://hampg.github.io/matekOpera/

A `main` ágra feltöltött változatokat a GitHub Actions teszteli, majd GitHub Pagesre publikálja. A Pages build `/matekOpera/` alapútvonalat használ, a Sites és helyi build továbbra is `/` alatt működik.

Magyar nyelvű, reszponzív matematikagyakorló React + TypeScript + Vite alapon. A szülőmappában található nyelvi alkalmazástól független projekt.

## Indítás

Node.js 20.19+ vagy 22.12+ szükséges.

```sh
npm install
npm run dev
```

A terminálban megjelenő helyi címet nyisd meg. Éles csomag: `npm run build`, az eredmény a `dist/` mappában keletkezik. A mappát HTTP(S)-kiszolgálón kell futtatni; nem közvetlen fájlmegnyitással. Matematikai tesztek: `npm test`.

## Használat

- **Tanulok:** alapműveleti összefüggések, a 7-es–9-es szorzótábla stratégiái, kerület és terület, állítható SVG-ábra, rövid ellenőrző feladatok.
- **Gyakorlok:** témaválasztás, műveletek, 0–100 vagy 0–1000 számkör, három nehézség, 5/10/20 vagy folyamatos gyakorlás. Az eltelt idő opcionális, nincs visszaszámlálás.
- **Kihívás:** váltakozó alapműveleti, szorzótáblás és geometriai feladatok.
- **Segíts!:** rávezetés, részmegoldás, majd teljes levezetés. Hibás válasz után újrapróbálkozás jár. Pontlevonás nincs.
- **Párosítás:** művelet kijelölése, majd eredmény megérintése; egérrel húzás is használható. Billentyűzettel Tab és Enter/Space.

## Matematikai döntések

A `src/math.ts` tiszta, magértékkel determinisztikusan vezérelhető generátort tartalmaz. A számkör az operandusokat és a normál műveletek eredményét is korlátozza. Nincsenek negatív vagy tört válaszok. Az osztó soha nem nulla; a maradék kisebb az osztónál. A hányadost és maradékot külön ellenőrizzük, nulla maradékot is be kell írni.

A geometriai feladatok négyzettel, téglalappal és 3–4–5 arányú derékszögű háromszögekkel dolgoznak, így a magasság és a harmadik oldal is egész, a háromszög valós. Az ábrák sematikusak és ezt jelzik. A feladatok cm/cm² és m/m² egységet használnak. Vannak hiányzó oldalhossz-, csúcsszám-, terület-összehasonlító és képletalkalmazó párosítási feladatok. A geometriai interakciónál a csúszka a feladat méreteit és a helyes választ is megváltoztatja. A haladó alapműveleti gyakorlás zárójeles, több lépéses feladatokat is ad.

A magyarázatok ellenőrizhető, számszerű sablonok, nem futásidőben generált AI-szövegek. A nehézség csak nyolc lezárt feladat után változhat. Legalább hét elsőre, segítség nélkül megoldott feladat indokol szintlépést; legfeljebb három ilyen megoldásnál könnyítünk. Egyébként a szint marad. A szorzótáblánál a hibás szorzatok nagyobb valószínűséggel ismétlődnek.

Önálló első megoldás: 10 pont, újrapróbálkozással vagy segítséggel: 6 pont. Minden öt megoldás egy csillag. Öt megoldás után kitartásjelvény jár; öt tiszta megoldás után a biztos számoló jelvény is.

## Adatok és offline használat

Nincs regisztráció, API, adatbázis, analitika vagy tartós teljesítménytárolás. A React állapota csak a nyitott lap élettartamára őrzi a munkamenetet; újratöltéskor törlődik. Az alkalmazás nem kér külső betűtípust vagy képet.

A production build service workere HTTPS-en (vagy localhoston) az első sikeres teljes betöltéskor gyorsítótárazza a HTML-, JS- és CSS-fájlokat. Ezt követően ugyanazon böngészőben offline is működhet, amíg a böngésző nem törli a gyorsítótárat. A Sites privát hozzáférési rétege internetes bejelentkezést kérhet; a saját statikus kiszolgálásnak nincs ilyen függősége. A fejlesztői szerver helyett a buildet használd az offline működéshez.

## Ellenőrzés és korlátok

Az automatikus tesztek 24 000 alapműveleti és 2000 geometriai generálást, szorzótáblás ismétlést, determinisztikusságot, segítségszövegek számszerű elemeit és az adaptív küszöböket vizsgálják. A build TypeScript-ellenőrzést is futtat. A böngészős ellenőrzés a fő navigációra, hibás válaszra, segítségre, pontozásra és keskeny mobilnézetre terjed ki. Fizikai érintőképernyős eszközön külön kipróbálás ajánlott.

A tanulórész három összefüggő leckét tartalmaz; nem teljes tantervi leckekönyvtár. A geometriai nehézség egyelőre azonos feladatcsaládokat használ minden szinten. A hibaminta-követés a konkrét elrontott szorzatok ismétlésére és az általános segítség/próbálkozás előzményekre korlátozódik.
