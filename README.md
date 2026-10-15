# slop-egzamin

Aplikacja webowa (React + Vite) do nauki pytań z egzaminu **CCNA 1 v7 – Modules 1–3: Basic Network Connectivity and Communications**.

Źródło pytań: [itexamanswers.net](https://itexamanswers.net/ccna-1-v7-modules-1-3-basic-network-connectivity-and-communications-exam-answers.html)

## Tryby

- **Nauka** – pytania po kolei, wynik i wyjaśnienie od razu po każdej odpowiedzi.
- **Nauka losowa** – to samo, ale w losowej kolejności.
- **Egzamin próbny** – 10 / 20 / 40 / wszystkie losowe pytania bez podpowiedzi, wynik na końcu (próg 70%).
- **Powtórka błędów** – tylko pytania, na które ostatnio padła zła odpowiedź.
- **Przeglądaj** – lista wszystkich pytań z odpowiedziami i wyszukiwarką.

Postęp jest zapisywany w `localStorage` przeglądarki. Skróty: `1`–`6` zaznacza odpowiedź, `Enter` sprawdza / przechodzi dalej, `←` / `→` nawigacja.

## Weryfikacja odpowiedzi

Strona źródłowa ma 75 pytań (numer 60 nie występuje). Każdą odpowiedź sprawdzono z materiałem Cisco ITN v7 i z obrazkami do zadań typu „dopasuj”. Wszystkie odpowiedzi ze źródła są poprawne. Wprowadzone poprawki:

| # | Zmiana |
|---|--------|
| 18 | Wyjaśnienie opisywało dostęp VTY/Telnet, a pytanie dotyczy konsoli – poprawione (odpowiedź `lineconin` jest prawidłowa). Konfigurację z obrazka przepisano jako tekst. |
| 27, 36 | Zadania „dopasuj” miały odpowiedzi tylko na obrazku – pary przepisane do danych. |
| 5 | Dodano opcje-zmyłki z oryginalnego zadania (opisy QoS). |
| 19, 43, 54 | Obrazki/kod z pytań przepisane jako tekst; usunięte śmieci z HTML (np. „Copy”). |
| 47 | Literówka w wyjaśnieniu („edded” → „added”). |
| 52 | Pytanie z Packet Tracera – nie da się go zweryfikować bez pliku `.pka`, oznaczone jako niezweryfikowane. |
| 74 | Literówka w odpowiedzi („Fire optic cable” → „Fiber-optic cable”). |
| 28, 38, 41, 59, 65, 73 | Uzupełnione brakujące lub puste wyjaśnienia. |

Dane są w `src/data/questions.json`. Skrypty `scripts/parse.mjs` (HTML → JSON) i `scripts/finalize.mjs` (poprawki z weryfikacji) pozwalają je odtworzyć:

```sh
node scripts/parse.mjs page.html raw.json
node scripts/finalize.mjs raw.json src/data/questions.json
```

## Uruchomienie

```sh
npm install
npm run dev
```

Wdrożenie na GitHub Pages odbywa się automatycznie (workflow `.github/workflows/deploy.yml`) po pushu na `main`.
