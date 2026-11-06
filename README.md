# Bezpieczeństwo w internecie – podstawy: ćwiczenia praktyczne

Interaktywne ćwiczenia do modułu „Bezpieczeństwo w internecie – podstawy” kursu „Kompetencje cyfrowe i bezpieczeństwo online” (InvertArt IFG).
Osiemnaście ćwiczeń z punktacją w dwóch częściach (każda około 60 minut, razem maksymalnie 450 punktów) oraz lista „Zrób to dziś” z 11 ustawieniami do zrobienia na własnym telefonie i kontach.

Materiał jest przygotowany dla dorosłych osób z Ukrainy, które wracają na rynek pracy w Polsce: prosty język polski (ok. B1), formy neutralne płciowo, przykłady z życia codziennego i pracy.

**Część 1: Podstawy**

| Nr | Ćwiczenie | Forma |
|---|---|---|
| 1 | Hasła i logowanie | ocena haseł, reakcja na podejrzane logowanie |
| 2 | Fałszywe SMS-y | ocena wiadomości |
| 3 | Fałszywy e-mail | zaznaczanie sygnałów ostrzegawczych |
| 4 | Czytanie adresów stron | prawdziwa strona czy podróbka |
| 5 | Bezpieczny telefon | sortowanie ustawień |
| 6 | Telefony od oszustów | „bank”, „policja”, „córka”, „pomoc techniczna”, „urząd” |
| 7 | Pieniądze w internecie | BLIK, portale ogłoszeniowe, sklepy, zbiórki |
| 8 | Co można opublikować? | sortowanie postów |
| 9 | Co zrobić, gdy coś się stanie | bank, 8080, incydent.cert.pl, PESEL, SIM, 112 |
| – | Zrób to dziś | 11 ustawień krok po kroku: telefon, konta, dom i rodzina |

**Część 2: Codzienne sytuacje**

| Nr | Ćwiczenie | Forma |
|---|---|---|
| 10 | Fałszywy sklep internetowy | zaznaczanie sygnałów na stronie sklepu |
| 11 | „Kupujący” na portalu ogłoszeniowym | zaznaczanie sygnałów w rozmowie z oszustem |
| 12 | Włączanie logowania dwuetapowego | układanie kroków |
| 13 | Uprawnienia aplikacji | zezwolić czy nie (m.in. ułatwienia dostępu) |
| 14 | Poza domem: Wi-Fi, QR i telefon | sortowanie nawyków |
| 15 | Media społecznościowe | przejęte konta, fałszywe konkursy, oszustwa „na miłość” |
| 16 | Dzieci w internecie | kontrola rodzicielska, zakupy w grach, rozmowa z dzieckiem |
| 17 | Bezpieczeństwo w pracy | Win + L, pendrive, „szef”, dane klientów |
| 18 | Test końcowy | powtórka najważniejszych zasad |


Wszystkie firmy, numery, adresy i wiadomości w ćwiczeniach są wymyślone. Strona jest napisana w czystym HTML, CSS i JavaScript, bez bibliotek i zewnętrznych zasobów, i działa także offline.

## Struktura

```
index.html          strona główna
assets/style.css    wygląd (tryb jasny i ciemny)
assets/script.js    logika i treść ćwiczeń
.nojekyll           wyłącza przetwarzanie Jekyll na GitHub Pages
```

## Publikacja na GitHub Pages

1. Utwórz nowe repozytorium, np. `cwiczenia-bezpieczenstwo-podstawy`.
2. Wgraj zawartość folderu: **Add file → Upload files**, potem **Commit changes**.
3. **Settings → Pages → Deploy from a branch**, gałąź **main**, folder **/ (root)**, **Save**.
4. Po 1–2 minutach strona będzie pod adresem `https://NAZWA-UZYTKOWNIKA.github.io/cwiczenia-bezpieczenstwo-podstawy/`

## Uwagi

- Wyniki i zaznaczenia z listy „Zrób to dziś” zapisują się lokalnie w przeglądarce uczestnika (localStorage).
- Treść ćwiczeń jest w `assets/script.js`: `QPASS`, `QSMS`, `MAIL`, `QURL`, `PHONE`, `QCALL`, `QMONEY`, `POSTS`, `PQ` i `PLACES` (część 1) oraz `SHOP`, `BUYER`, `STEPS2FA`, `QPERM`, `NETS`, `QSOC`, `QKIDS`, `QWORK`, `QFINAL` (część 2), a lista „Zrób to dziś” w tablicy `LIB`.
- Nazwy w ustawieniach telefonów różnią się w zależności od producenta i wersji systemu. Przed zajęciami warto sprawdzić ścieżki na popularnych telefonach.
- Przed zajęciami warto też potwierdzić aktualność usług zgłoszeniowych CERT Polska (SMS 8080, incydent.cert.pl).
