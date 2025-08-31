import { PixelizationEffect } from './pixelization-effect.js';
import { CursorPaintEffect } from './cursor-paint-effect.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize pixelization effect (Section 1)
  let pixelEffect = null;
  const canvas = document.getElementById('pixelCanvas');
  const heroImage = document.getElementById('heroImage');

  if (canvas && heroImage) {
    const effectOptions = {
      duration: 4000, // 4 seconds total
      maxPixelSize: 64, // Largest pixels
      minPixelSize: 2, // Smallest pixels
      runOnlyOnce: true, // Animation runs only once (default behavior)
    };

    heroImage.addEventListener('load', () => {
      pixelEffect = new PixelizationEffect(canvas, heroImage, effectOptions);
    });

    // If image is already loaded
    if (heroImage.complete && heroImage.naturalWidth > 0) {
      pixelEffect = new PixelizationEffect(canvas, heroImage, effectOptions);
    }
  }

  // Initialize cursor paint effect (Section 2)
  let paintEffect = null;
  const paintCanvas = document.getElementById('paintCanvas');
  const paintImage = document.getElementById('paintImage');

  if (paintCanvas && paintImage) {
    const paintOptions = {
      brushSize: 450, // Size of paint brush
      maxPixelSize: 128, // Largest pixels
      minPixelSize: 1, // Smallest pixels
      pixelTransitionSpeed: 800, // 2 seconds to go from large to small pixels
      fadeInSpeed: 300, // 300ms fade in
      enabled: false, // Start disabled
    };

    paintImage.addEventListener('load', () => {
      paintEffect = new CursorPaintEffect(
        paintCanvas,
        paintImage,
        paintOptions
      );
    });

    // If image is already loaded
    if (paintImage.complete && paintImage.naturalWidth > 0) {
      paintEffect = new CursorPaintEffect(
        paintCanvas,
        paintImage,
        paintOptions
      );
    }
  }
  // Wykrywanie przewijania dla nagłówka i floating button
  const siteHeader = document.querySelector('.site-header');
  const floatingButton = document.getElementById('floating-button');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Floating button visibility - pokazuj od sekcji 2
    if (floatingButton) {
      if (window.scrollY > window.innerHeight * 0.9) {
        floatingButton.classList.add('visible');
      } else {
        floatingButton.classList.remove('visible');
      }
    }
  });

  // Floating button functionality
  if (floatingButton) {
    floatingButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

  // Krok 5: Implementacja Nawigatora Bocznego (JS) - Zrefaktoryzowane
  const sideNavLinks = document.querySelectorAll('.side-nav a');
  const sections = document.querySelectorAll('section[id]');
  let activeTooltipTimer;
  let currentActiveSection = null;

  // Płynne przewijanie po kliknięciu
  sideNavLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Logika dla tooltipów przy najechaniu myszką (dla nieaktywnych elementów)
  sideNavLinks.forEach((link) => {
    let tooltipTimer;
    link.addEventListener('mouseenter', () => {
      if (!link.classList.contains('active')) {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        link.classList.add('tooltip-visible');
        link.classList.remove('tooltip-hidden');
        tooltipTimer = setTimeout(() => {
          link.classList.remove('tooltip-visible');
          link.classList.add('tooltip-hidden');
        }, 5000);
      }
    });

    link.addEventListener('mouseleave', () => {
      if (!link.classList.contains('active')) {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        link.classList.remove('tooltip-visible');
        link.classList.add('tooltip-hidden');
      }
    });
  });

  // Główna funkcja do zarządzania zmianą aktywnej sekcji
  const handleSectionChange = (newSectionId) => {
    if (newSectionId === currentActiveSection) {
      return; // Bez zmian, przerwij
    }
    currentActiveSection = newSectionId;

    // Aktualizuj progress ring gdy sekcja się zmienia
    if (floatingButton && newSectionId) {
      const totalSections = 8;
      const progressRing = floatingButton.querySelector('.progress-ring-fill');
      const sectionNumber = parseInt(newSectionId.replace('sekcja', ''));
      
      // Oblicz procent postępu (od 0 do 100%)
      const progressPercent = (sectionNumber / totalSections) * 100;
      const circumference = 175.929; // 2 * π * 28
      const offset = circumference - (progressPercent / 100) * circumference;
      
      if (progressRing) {
        progressRing.style.strokeDashoffset = offset;
      }
    }

    // Zarządzanie efektami wizualnymi
    if (newSectionId === 'sekcja1') {
      if (pixelEffect) pixelEffect.startAnimation();
      if (paintEffect) paintEffect.disable();
    } else if (newSectionId === 'sekcja2') {
      if (paintEffect) {
        paintEffect.reset();
        paintEffect.enable();
      }
    } else {
      if (paintEffect) paintEffect.disable();
    }

    // Zarządzanie nawigacją boczną (klasy i tooltips)
    if (activeTooltipTimer) {
      clearTimeout(activeTooltipTimer);
    }

    sideNavLinks.forEach((link) => {
      const isTargetLink = link.getAttribute('href') === `#${newSectionId}`;
      link.classList.toggle('active', isTargetLink);

      // Pokaż tooltip dla aktywnego linku (ale nie dla sekcji 1)
      if (isTargetLink && newSectionId !== 'sekcja1') {
        link.classList.remove('tooltip-hidden');
        link.classList.add('tooltip-visible');

        activeTooltipTimer = setTimeout(() => {
          link.classList.remove('tooltip-visible');
          link.classList.add('tooltip-hidden');
        }, 2000);
      } else {
        link.classList.remove('tooltip-visible');
        link.classList.add('tooltip-hidden');
      }
    });
  };

  // Scroll Spy z Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.8, // 80% sekcji musi być widoczne
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    let mostVisibleSection = null;
    let highestRatio = 0;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
        highestRatio = entry.intersectionRatio;
        mostVisibleSection = entry.target;
      }
    });

    if (mostVisibleSection) {
      handleSectionChange(mostVisibleSection.id);
    } else if (!document.querySelector('section[id].active')) {
        // Jeśli żadna sekcja nie jest aktywna (np. na samej górze strony)
        handleSectionChange(null);
    }
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // Uruchomienie animacji przy ładowaniu strony, jeśli sekcja 1 jest widoczna
  setTimeout(() => {
    if (window.scrollY < window.innerHeight / 2) {
      handleSectionChange('sekcja1');
    }
  }, 100);
});
