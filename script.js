document.addEventListener('DOMContentLoaded', () => {
  // Wykrywanie przewijania dla nagłówka
  const siteHeader = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // Krok 4: Implementacja Menu (JS) - ZMIANA DLA ANIMACJI
  const menuToggle = document.querySelector('.site-header .menu-toggle');
  const navOverlay = document.getElementById('nav-overlay');

  menuToggle.addEventListener('click', () => {
    navOverlay.classList.toggle('is-open');
    document.querySelector('.fullscreen-nav').classList.toggle('is-open');
    menuToggle.classList.toggle('is-active'); // Przełącz klasę na przycisku
    // Usunięto blokowanie scrollbara - strona nadal się przewija
  });

  // Zamykanie menu po kliknięciu na link
  const navLinks = document.querySelectorAll('.fullscreen-nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navOverlay.classList.contains('is-open')) {
        navOverlay.classList.remove('is-open');
        document.querySelector('.fullscreen-nav').classList.remove('is-open');
        menuToggle.classList.remove('is-active'); // Usuń klasę z przycisku
        // Usunięto przywracanie overflow - nie jest już potrzebne
      }
    });
  });

  // Krok 5: Implementacja Nawigatora Bocznego (JS)
  const sideNavLinks = document.querySelectorAll('.side-nav a');
  const sections = document.querySelectorAll('section[id]');

  // Płynne przewijanie po kliknięciu
  sideNavLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Tooltip auto-hide po 5 sekundach
  sideNavLinks.forEach((link) => {
    let tooltipTimer;

    link.addEventListener('mouseenter', () => {
      // Hover działa tylko dla nieaktywnych sekcji
      if (!link.classList.contains('active')) {
        // Usuń poprzedni timer jeśli istnieje
        if (tooltipTimer) {
          clearTimeout(tooltipTimer);
        }

        // Pokaż tooltip
        link.classList.add('tooltip-visible');
        link.classList.remove('tooltip-hidden');

        // Ustaw timer na 5 sekund
        tooltipTimer = setTimeout(() => {
          // Ukryj tooltip po 5 sekundach
          link.classList.remove('tooltip-visible');
          link.classList.add('tooltip-hidden');
        }, 5000);
      }
    });

    link.addEventListener('mouseleave', () => {
      // Mouseleave działa tylko dla nieaktywnych sekcji
      if (!link.classList.contains('active')) {
        // Wyczyść timer przy opuszczeniu
        if (tooltipTimer) {
          clearTimeout(tooltipTimer);
          tooltipTimer = null;
        }

        // Ukryj tooltip przy opuszczeniu
        link.classList.remove('tooltip-visible');
        link.classList.add('tooltip-hidden');
      }
    });
  });

  // Timer dla aktywnego tooltipa i aktywna sekcja
  let activeTooltipTimer;
  let currentActiveSection = null;

  // Scroll Spy z Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.8, // 80% sekcji musi być widoczne - wyższy próg
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    // Znajdź sekcję z najwyższym procentem widoczności
    let mostVisibleSection = null;
    let highestRatio = 0;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
        highestRatio = entry.intersectionRatio;
        mostVisibleSection = entry.target;
      }
    });

    // Aktywuj tylko sekcję z najwyższym procentem widoczności
    if (mostVisibleSection) {
      const targetId = '#' + mostVisibleSection.id;
      
      // Dla sekcji1 - wyczyść wszystkie aktywne stany i zakończ
      if (targetId === '#sekcja1') {
        if (currentActiveSection === 'sekcja1') {
          return; // Już jesteśmy na sekcji 1, nic nie rób
        }
        
        currentActiveSection = 'sekcja1';
        if (activeTooltipTimer) {
          clearTimeout(activeTooltipTimer);
          activeTooltipTimer = null;
        }
        sideNavLinks.forEach((link) => {
          link.classList.remove('tooltip-visible');
          link.classList.add('tooltip-hidden');
          link.classList.remove('active');
        });
        return;
      }
      
      // Jeśli ta sama sekcja już jest aktywna, nie rób nic
      if (currentActiveSection === mostVisibleSection.id) {
        return;
      }
      
      // Zapisz nową aktywną sekcję
      currentActiveSection = mostVisibleSection.id;
      
      // Wyczyść poprzedni timer przy zmianie sekcji
      if (activeTooltipTimer) {
        clearTimeout(activeTooltipTimer);
        activeTooltipTimer = null;
      }
      
      sideNavLinks.forEach((link) => {
        // Ukryj tooltip dla wszystkich sekcji (nieaktywnych)
        link.classList.remove('tooltip-visible');
        link.classList.add('tooltip-hidden');

        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
          link.classList.add('active');
          // Pokaż tooltip dla nowej aktywnej sekcji
          link.classList.remove('tooltip-hidden');
          link.classList.add('tooltip-visible');
          
          // Ustaw timer na 2 sekundy dla aktywnej sekcji
          activeTooltipTimer = setTimeout(() => {
            // Sprawdź czy nadal jest aktywna przed ukryciem
            if (link.classList.contains('active')) {
              link.classList.remove('tooltip-visible');
              link.classList.add('tooltip-hidden');
            }
          }, 2000);
        }
      });
    }
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

});
