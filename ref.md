Finalna Dokumentacja Techniczna: Klon Strony CONCEPTFAB

1. Wprowadzenie i Filozofia Projektu
   Strona CONCEPTFAB to nowoczesna wizytówka typu "one-page". Jej celem jest wywołanie "efektu wow" poprzez filmowe, immersyjne doświadczenie.
   Styl: Minimalistyczny, premium, kinowy.
   Kluczowe elementy: Wideo w tle, duże, wysokiej jakości obrazy, subtelne animacje i bardzo czytelna, prosta nawigacja.
   Technologia (cel klonowania): Implementacja bez zewnętrznych bibliotek i frameworków (czysty HTML, CSS i JavaScript).
2. Struktura Dokumentu (HTML)
Szkielet strony powinien być semantyczny i przejrzysty.
<header class="site-header">: Przyklejony do górnej krawędzi.
Logo po lewej stronie.
Przycisk (<button class="menu-toggle">) "Menu"/"Close" po prawej.
<main>: Główny kontener na wszystkie sekcje. Każda sekcja powinna mieć unikalne id dla nawigacji.
<section id="hero" class="hero-section">: Pierwszy ekran z wideo w tle.
<section id="intro" class="content-section">: Sekcja "Inspiring Audiences".
<section id="theme-parks" class="content-section">: Sekcja tematyczna.
<section id="theatre-arena" class="content-section">: Sekcja tematyczna.
<section id="exhibitions" class="content-section">: Sekcja tematyczna.
<section id="events" class="content-section">: Sekcja tematyczna.
<section id="films" class="content-section">: Sekcja tematyczna.
<section id="about" class="about-section">: Sekcja "O nas".
<footer>: Stopka strony z linkami do mediów społecznościowych i informacjami prawnymi.
<div id="nav-overlay" class="nav-overlay">: Ukryta warstwa z pełnoekranowym menu.
<nav class="side-nav">: Pionowy nawigator boczny (kropki).
3. Styl i Wygląd (CSS)
   Estetyka strony jest kluczowa i opiera się na prostocie i kontraście.
   Paleta Kolorów:
   Tło główne: black (#000000).
   Tekst: white (#FFFFFF).
   Akcenty: Brak. Siła wizualna pochodzi z obrazów i wideo, a nie z kolorów.
   Typografia:
   Font: Oryginalnie używany jest "Neue Haas Grotesk". Dobrymi, darmowymi zamiennikami z Google Fonts będą Inter lub Manrope.
   Nagłówki: Duże, pisane wielkimi literami (text-transform: uppercase), ze zwiększonym odstępem między znakami (letter-spacing).
   Tekst główny: Czytelny, prosty, o standardowej wielkości.
   Układ (Layout):
   Full-screen Hero: Sekcja hero powinna zajmować 100vh (całą wysokość okna).
   Sekcje treści: Naprzemienny układ dwukolumnowy (obraz po lewej, tekst po prawej, i odwrotnie). Do tego celu idealnie nadaje się display: flex lub display: grid.
   Responsywność: Strona musi być w pełni responsywna. Na urządzeniach mobilnych (@media (max-width: 768px)), układ dwukolumnowy powinien zmienić się na jednokolumnowy (obraz nad tekstem). Menu, nawigator i inne elementy muszą być dostosowane do mniejszych ekranów.
4. Interaktywność i Funkcjonalność (JavaScript)
   To serce projektu, które ożywi statyczną stronę. Wszystkie poniższe funkcje należy zaimplementować w czystym JS.
   Logika działania:
   Pobierz w JS przycisk "Menu" (.menu-toggle) i nakładkę nawigacyjną (.nav-overlay).
   Po kliknięciu przycisku, przełączaj klasę (np. .is-open) na elemencie <body> lub na samej nakładce.
   CSS będzie odpowiadać za stylizację: gdy klasa .is-open jest obecna, nakładka ma opacity: 1 i visibility: visible, a na <body> ustawione jest overflow: hidden, aby zablokować przewijanie tła.
   Kliknięcie na link w menu lub przycisk "Close" powinno usuwać klasę .is-open, zamykając menu.
   Ten element ma trzy kluczowe funkcjonalności.
   Struktura: Pionowa lista linków (<a href="#section-id">), gdzie każdy link jest stylizowany na kropkę.
   Funkcjonalność 1: Kliknięcie i Płynne Przewijanie
   Dodaj event listener na kliknięcie do każdego linku w nawigatorze.
   W funkcji obsługi zdarzenia, anuluj domyślną akcję (event.preventDefault()).
   Pobierz id sekcji z atrybutu href.
   Użyj document.querySelector(id).scrollIntoView({ behavior: 'smooth' }).
   Funkcjonalność 2: Automatyczna Aktualizacja Aktywnej Kropki (Scroll Spy)
   Metoda: Użyj Intersection Observer API – jest to najwydajniejsze rozwiązanie.
   Implementacja:
   Stwórz obserwatora: const observer = new IntersectionObserver(callback, options);. W options ustaw próg widoczności, np. threshold: 0.5, co oznacza, że callback uruchomi się, gdy 50% sekcji będzie widoczne.
   Wskaż obserwatorowi, które elementy ma śledzić: pobierz wszystkie sekcje (document.querySelectorAll('section[id]')) i dla każdej wywołaj observer.observe(section).
   W funkcji callback obserwatora, pętla przejdzie przez wszystkie "wpisy" (entries). Dla każdego wpisu, który jest widoczny (entry.isIntersecting), znajdź odpowiadający mu link w nawigatorze bocznym.
   Usuń klasę .active ze wszystkich linków w nawigatorze, a następnie dodaj ją tylko do tego, który odpowiada widocznej sekcji.
   Funkcjonalność 3: Tooltip z Nazwą Sekcji
   Można to zrealizować w czystym CSS, używając atrybutu data-tooltip na linku i pseudoelementu ::after, który staje się widoczny po najechaniu (:hover).
   Logika działania: Elementy (np. bloki tekstowe, nagłówki) pojawiają się, gdy użytkownik przewinie stronę do ich poziomu.
   Metoda: Ponownie, Intersection Observer API jest idealnym narzędziem.
   Implementacja:
   W CSS, ukryj domyślnie animowane elementy (np. opacity: 0; transform: translateY(20px);). Dodaj też płynne przejście (transition: all 0.5s ease-out;).
   Stwórz drugiego obserwatora (lub użyj tego samego z inną konfiguracją) do śledzenia tych elementów.
   Gdy obserwator wykryje, że element wszedł w pole widzenia (entry.isIntersecting), dodaj do niego klasę, np. .is-visible.
   CSS dla klasy .is-visible przywróci elementy do ich normalnego stanu (opacity: 1; transform: translateY(0);).
   (Opcjonalnie) Po dodaniu klasy, można przestać obserwować element (observer.unobserve(entry.target)), aby animacja odpaliła się tylko raz.
5. Lista Zasobów (Assets)
   Do stworzenia wiernego klona potrzebne będą:
   Wideo: Klipy wideo dla sekcji Hero i "Showreel".
   Obrazy: Wszystkie zdjęcia użyte w sekcjach tematycznych.
   Logo: Plik SVG lub PNG z logo CONCEPTFAB.
   Ikony: Ikony mediów społecznościowych (Instagram, TikTok).
   Fonty: Zidentyfikowany krój pisma lub jego darmowy odpowiednik (np. z Google Fonts).
6. Plan Działania (Krok po Kroku)
   Krok 1: Struktura HTML – Stwórz plik index.html ze wszystkimi opisanymi sekcjami i elementami.
   Krok 2: Podstawowy CSS – Ostyluj surowy HTML, ustawiając tło, kolory, typografię i podstawowy układ (layout).
   Krok 3: Responsywność – Dodaj media queries, aby strona poprawnie wyświetlała się na tabletach i smartfonach.
   Krok 4: Implementacja Menu (JS) – Oprogramuj logikę otwierania i zamykania pełnoekranowego menu.
   Krok 5: Implementacja Nawigatora Bocznego (JS) – Dodaj funkcjonalność klikania i automatycznej aktualizacji aktywnej kropki.
   Krok 6: Implementacja Animacji (JS) – Zastosuj Intersection Observer, aby dodać animacje pojawiania się treści przy przewijaniu.
   Krok 7: Finalne Poprawki – Przetestuj stronę na różnych przeglądarkach i urządzeniach, dopracuj detale i zoptymalizuj ładowanie zasobów.
