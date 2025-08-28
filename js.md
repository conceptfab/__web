 Biblioteki do efektów na obrazach i WebGL

  Te biblioteki są idealne do zaawansowanych, wydajnych efektów graficznych, takich jak pikselizacja, zniekształcenia czy przejścia.

   1. PixiJS: To niezwykle szybka biblioteka do renderowania 2D, która automatycznie wykorzystuje WebGL dla maksymalnej wydajności (z rezerwowym trybem Canvas).
      Jest świetna do tworzenia gier i interaktywnych, bogatych wizualnie stron. Efekty takie jak pikselizacja są dostępne jako gotowe "filtry".
       * Zastosowanie: Idealna do skomplikowanych animacji, efektów na wielu elementach i gier.
       * Strona: https://pixijs.com/

   2. Three.js: Najpopularniejsza biblioteka do grafiki 3D (i 2D) w WebGL. Chociaż kojarzona głównie z 3D, jest fantastycznym narzędziem do tworzenia efektów na
      płaskich obrazach za pomocą tzw. shaderów. Efekt pikselizacji czy "malowania" można zaimplementować bardzo wydajnie właśnie przy użyciu shaderów.
       * Zastosowanie: Efekty zniekształceń, przejścia między obrazami, cząsteczki, grafika 3D.
       * Strona: https://threejs.org/

   3. OGL (OpenGL Library): Mniejsza i lżejsza alternatywa для Three.js, która nie ma żadnych zależności i jest bardzo "blisko" WebGL. Daje dużą kontrolę, ale
      wymaga też nieco więcej wiedzy.
       * Zastosowanie: Dla tych, którzy chcą pełnej kontroli nad WebGL bez narzutu dużej biblioteki.
       * Strona: https://o-gl.g-for-generator.com/

  Biblioteki do animacji i interakcji

  Te biblioteki skupiają się na animowaniu dowolnych właściwości CSS i elementów DOM, co czyni je świetnymi do interakcji z kursorem i ogólnych animacji na
  stronie.

   1. GSAP (GreenSock Animation Platform): Uważana za branżowy standard w animacji webowej. Jest niezwykle wydajna, elastyczna i ma wtyczki do niemal wszystkiego.
      Można nią z łatwością animować elementy DOM, SVG, Canvas i obiekty WebGL.
       * Zastosowanie: Płynne animacje, skomplikowane sekwencje (timelines), animacje na scroll, efekty z kursorem.
       * Strona: https://greensock.com/gsap/

   2. Anime.js: Lekka i prosta w użyciu biblioteka do animacji z bardzo przyjaznym API. Jest świetną alternatywą dla GSAP, jeśli potrzebujesz czegoś mniejszego.
       * Zastosowanie: Animacje CSS, SVG, atrybutów DOM i obiektów JavaScript.
       * Strona: https://animejs.com/

  Biblioteki z gotowymi efektami

  Istnieją też mniejsze biblioteki, które oferują gotowe do użycia, specyficzne efekty.

   1. Hover-Effect: Biblioteka stworzona specjalnie do tworzenia efektu "płynnego" przejścia między dwoma obrazami przy najechaniu myszką, wykorzystująca WebGL.
       * Zastosowanie: Bardzo specyficzny, ale popularny efekt przejścia.
       * Strona: https://github.com/robin-dela/hover-effect

  Jeśli miałbym polecić jedną bibliotekę do tworzenia dokładnie takich efektów, jak te, które analizowaliśmy, ale w bardziej reużywalny sposób, skłaniałbym się
  ku PixiJS (dla filtrów graficznych) w połączeniu z GSAP (do sterowania animacją i interakcją).