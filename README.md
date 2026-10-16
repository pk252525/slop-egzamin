# grypser cisco

Aplikacja webowa (React + Vite) do nauki do egzaminów **CCNA 1 v7 – Introduction to Networks (ITN)**. Każdy egzamin ma osobną sekcję z własnym postępem:

| Sekcja | Pytania |
|--------|---------|
| Moduły 1–3: Basic Network Connectivity and Communications | 75 |
| Moduły 4–7: Ethernet Concepts | 70 |
| Moduły 8–10: Communicating Between Networks | 76 |
| Moduły 11–13: IP Addressing | 71 |
| Moduły 14–15: Network Application Communications | 61 |
| Moduły 16–17: Building and Securing a Small Network | 67 |
| Egzamin końcowy (ITNv7 Final Exam) | 157 |
| Egzamin praktyczny PTSA (Packet Tracer) | trening |

Źródło: [itexamanswers.net](https://itexamanswers.net/) – adresy stron są w `src/data/exams.json`.

## Tryby (egzaminy z pytaniami)

- **Nauka** – pytania po kolei, wynik i wyjaśnienie od razu po każdej odpowiedzi.
- **Nauka losowa** – to samo, ale w losowej kolejności.
- **Nowe pytania** – tylko pytania, na które jeszcze nie było odpowiedzi.
- **Egzamin próbny** – 10 / 20 / 40 / 60 / wszystkie losowe pytania bez podpowiedzi, wynik na końcu (próg 70%).
- **Powtórka błędów** – tylko pytania, na które ostatnio padła zła odpowiedź.
- **Przeglądaj** – lista wszystkich pytań z odpowiedziami i wyszukiwarką.

Postęp jest zapisywany w `localStorage` osobno dla każdego egzaminu (postęp ze starej wersji z modułami 1–3 jest przenoszony automatycznie). Skróty: `1`–`7` zaznacza odpowiedź, `Enter` sprawdza / przechodzi dalej, `←` / `→` nawigacja.

## PTSA (egzamin praktyczny)

Trzy scenariusze z egzaminu (R1/S1 192.168.10.0, Router-A/Switch-A 172.16.1.0, Central-RT/Central-SW 209.165.201.0):

- **Zadanie** – treść zadania z wartościami dla wybranego scenariusza.
- **Adresacja** – wypełnianie tabeli adresów (VLSM) ze sprawdzaniem i wyjaśnieniem; przycisk „Losowe zadanie” generuje nowe sieci do ćwiczeń.
- **Komendy** – krok po kroku wpisujesz komendy IOS dla routera i przełącznika; sprawdzanie akceptuje typowe skróty (`conf t`, `int g0/0/0`, `ip add`, `no shut`, `wr`…).
- **Rozwiązanie** – pełne skrypty do wklejenia, ustawienia komputerów.

Adresacja i skrypty są liczone w `src/ptsa.js`. `scripts/check-lab.mjs` sprawdza, że dla każdego scenariusza są identyczne z kluczem odpowiedzi ze strony źródłowej, i testuje sprawdzanie komend.

## Weryfikacja odpowiedzi

Każde pytanie przejrzano z materiałem Cisco ITN v7, a zadania z obrazkami sprawdzono z obrazkiem. Poprawki są w `scripts/fixes/<egzamin>.mjs` i są widoczne w aplikacji jako „Uwaga z weryfikacji”. Najważniejsze:

- zadania „dopasuj” i „ułóż w kolejności”, które na stronie były tylko obrazkami, przepisano do danych (z opcjami-zmyłkami); obrazki z rozwiązaniem nie są pokazywane,
- moduły 14–15 #13 – drugi obrazek w źródle ma błędną kolejność zamykania sesji TCP; użyto poprawnej (FIN, ACK, FIN, ACK),
- egzamin końcowy #33 – wyjaśnienie w źródle dotyczyło innego pytania; napisano nowe,
- moduły 8–10 #70, #76 – konfiguracja z obrazka była na stronie wpisana jako odpowiedzi; odtworzono pytanie,
- pytania z Packet Tracera (wymagające pliku `.pka`) są oznaczone jako niezweryfikowane,
- uzupełniono kilkadziesiąt brakujących wyjaśnień, usunięto duplikat (egzamin końcowy #120), poprawiono literówki.

Szczegóły dla modułów 1–3 (pierwsza wersja aplikacji):

| # | Zmiana |
|---|--------|
| 18 | Wyjaśnienie opisywało dostęp VTY/Telnet, a pytanie dotyczy konsoli – poprawione. Konfigurację z obrazka przepisano jako tekst. |
| 27, 36 | Zadania „dopasuj” miały odpowiedzi tylko na obrazku – pary przepisane do danych. |
| 5 | Dodano opcje-zmyłki z oryginalnego zadania (opisy QoS). |
| 19, 43, 54 | Obrazki/kod z pytań przepisane jako tekst. |
| 52 | Pytanie z Packet Tracera – oznaczone jako niezweryfikowane. |
| 74 | Literówka w odpowiedzi („Fire optic cable” → „Fiber-optic cable”). |

## Dane

Dane są w `src/data/<egzamin>.json`, obrazki do pytań w `public/img/<egzamin>/`. Odtworzenie (pobiera strony i obrazki do katalogu `.cache`):

```sh
node scripts/build.mjs .cache            # wszystkie egzaminy
node scripts/build.mjs .cache m4-7 final # wybrane
node scripts/check-lab.mjs .cache/pages/ptsa.html
```

`scripts/parse.mjs` zamienia HTML strony na surowe pytania, `scripts/build.mjs` normalizuje je, nakłada poprawki z `scripts/fixes/` i sprawdza (liczba poprawnych odpowiedzi, brakujące wyjaśnienia itd.).

## Uruchomienie

```sh
npm install
npm run dev
```

Wdrożenie na GitHub Pages odbywa się automatycznie (workflow `.github/workflows/deploy.yml`) po pushu na `main`.
