# Reverse Pixelization Effect

Reużywalny efekt odwróconej pixelizacji dla obrazków. Tworzy 4-fazową animację przejścia z przezroczystego tła do finalnego obrazu.

## Instalacja

Skopiuj plik `pixelization-effect.js` do swojego projektu i zaimportuj go:

```javascript
import { PixelizationEffect } from './pixelization-effect.js';
```

## Podstawowe użycie

### HTML
```html
<div class="image-container">
  <canvas id="myCanvas" class="pixel-canvas"></canvas>
  <img src="image.jpg" alt="My Image" id="myImage" class="my-image">
</div>

<script type="module" src="script.js"></script>
```

### CSS
```css
.image-container {
  position: relative;
  width: 500px;
  height: 300px;
}

.pixel-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.my-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0; /* Zaczyna jako niewidoczny */
}
```

### JavaScript
```javascript
import { PixelizationEffect } from './pixelization-effect.js';

const canvas = document.getElementById('myCanvas');
const image = document.getElementById('myImage');

// Podstawowa konfiguracja
const effect = new PixelizationEffect(canvas, image);

// Uruchomienie animacji
effect.startAnimation();
```

## Zaawansowana konfiguracja

```javascript
const options = {
  duration: 5000,           // Czas trwania animacji (ms)
  maxPixelSize: 80,         // Maksymalny rozmiar pikseli
  minPixelSize: 1,          // Minimalny rozmiar pikseli
  phase1Duration: 0.2,      // Faza 1: przezroczyste tło (20%)
  phase2Duration: 0.3,      // Faza 2: średni kolor (30%)
  phase3Duration: 0.4,      // Faza 3: pixelizacja (40%)
  phase4Duration: 0.1       // Faza 4: finalny obraz (10%)
};

const effect = new PixelizationEffect(canvas, image, options);
```

## API

### Metody

#### `startAnimation(): Promise`
Uruchamia animację. Zwraca Promise który resolve'uje się po zakończeniu.

```javascript
effect.startAnimation().then(() => {
  console.log('Animacja zakończona!');
});
```

#### `reset()`
Resetuje efekt do stanu początkowego.

```javascript
effect.reset();
```

#### `complete()`
Przerywa animację i pokazuje finalny obraz.

```javascript
effect.complete();
```

#### `updateOptions(newOptions)`
Aktualizuje opcje konfiguracyjne.

```javascript
effect.updateOptions({ duration: 6000, maxPixelSize: 100 });
```

#### `destroy()`
Usuwa event listenery i czyści zasoby.

```javascript
effect.destroy();
```

### Factory Function

Alternatywnie możesz użyć funkcji factory:

```javascript
import { createPixelizationEffect } from './pixelization-effect.js';

const effect = createPixelizationEffect(canvas, image, options);
```

## Fazy animacji

1. **Faza 1 (0-25%)**: Przezroczyste tło - pokazuje kolor tła kontenera
2. **Faza 2 (25-50%)**: Średni kolor obrazu wyłania się (fade-in)
3. **Faza 3 (50-87.5%)**: Pixelizacja od dużych pikseli do małych
4. **Faza 4 (87.5-100%)**: Finalny obraz w pełnej rozdzielczości

## Przykład z Intersection Observer

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      effect.reset();
      effect.startAnimation();
    }
  });
});

observer.observe(document.getElementById('myImage'));
```

## Wymagania

- Nowoczesne przeglądarki z obsługą ES6 modules
- Canvas API
- Obrazki muszą być załadowane przed utworzeniem efektu

## Licencja

© 2025 CONCEPTFAB