# ONCE — Football Manager

Juego de gestión de fútbol single-page, ahora dividido en módulos.

## Cómo ejecutarlo

Abre `index.html` en un navegador. Por las restricciones de carga de archivos
locales (`file://`) en algunos navegadores, lo recomendable es servirlo con un
servidor estático local. Algunas opciones:

```bash
# Python 3
python3 -m http.server 8080

# Node (npx serve)
npx serve .

# PHP
php -S localhost:8080
```

Luego abre `http://localhost:8080`.

## Estructura

```
once-game/
├── index.html              Punto de entrada
├── css/
│   ├── theme.css           Variables y paleta (dark/light)
│   ├── base.css            Reset, body, fuentes, intro
│   ├── screen-setup.css    Pantalla de creación de club
│   ├── screen-hub.css      Hub principal: nav, paneles, sidebar
│   ├── screen-match.css    Pantalla de partido: header, canvas, panels
│   ├── panel-teams.css     Panel de equipos rivales
│   ├── panel-faq.css       Sección de Ayuda / FAQ
│   ├── modals.css          Modales: jugador, sustitución, negociación
│   └── responsive.css      Media queries móvil
└── js/
    ├── data.js             Constantes: nombres, formaciones, tácticas, divisiones
    ├── utils.js            Helpers: rnd, clamp, fmt, pick, chance, distP
    ├── state.js            Estado global G + persistencia (saveGame/loadGame)
    ├── i18n.js             Traducción ES/EN, función t(), applyLang, toggleLang
    ├── theme.js            applyTheme, toggleTheme
    ├── players.js          createPlayer, calcOverall, progresión, declive, match team
    ├── league.js           Calendario, divisiones, copa, ascensos/descensos
    ├── ui-hub.js           initHub, switchHubPanel, renderSquad, render*
    ├── ui-formation.js     Formación visual del sidebar (drag chapitas)
    ├── ui-playermodal.js   Modal de detalle de jugador, releasePlayer, lineup táctil
    ├── ui-teams.js         Panel de plantillas rivales con estrellas
    ├── ui-market.js        Mercado: negociación de fichajes con precio secreto
    ├── ui-offers.js        Ofertas rivales por tus jugadores
    ├── ui-faq.js           Datos FAQ (ES/EN) y changelog, renderFaq
    ├── match-engine.js     Motor de simulación 2D, IA, eventos
    ├── match-render.js     Dibujo en canvas
    ├── match-log.js        Log de eventos en directo
    ├── match-subs.js       Modal de sustituciones
    ├── match-postmatch.js  Resumen post-partido y fin de temporada
    ├── match-controls.js   Botones play/pause/speed, abandonMatch
    ├── setup-ui.js         Lógica de la pantalla de setup (color picker, división)
    └── main.js             showScreen + INIT (al final)
```

## Orden de carga de scripts

Importante respetar el orden en `index.html`:

1. **Base** — data, utils, state, i18n, theme
2. **Generación** — players, league
3. **UI hub** — ui-hub, ui-formation, ui-playermodal, ui-teams, ui-market, ui-offers, ui-faq
4. **Motor partido** — match-* (engine, render, log, subs, postmatch, controls)
5. **Setup UI** — setup-ui
6. **Init** — main (al final, contiene el IIFE de arranque)

## Cómo añadir funcionalidades

- **Nuevas tácticas / formaciones** → `js/data.js`
- **Estilos visuales** → archivo CSS correspondiente
- **Lógica de partido** → `js/match-engine.js`
- **Nuevas pantallas o paneles** → añadir `<div class="hub-panel">` al HTML, crear render en su propio archivo `js/ui-*.js` y registrar el script en `index.html`
- **Nueva clave de idioma** → añadir entrada en ambos `LANG.es` y `LANG.en` (en `i18n.js`) y usar `t('clave')` donde corresponda
- **Cambios de versión** → actualizar `GAME_VERSION` y añadir entrada al CHANGELOG_ES y CHANGELOG_EN en `js/ui-faq.js`

## Variables globales clave

- `G` — estado global del juego (en `state.js`)
- `match` — estado del partido en curso (en `match-engine.js`)
- `_lang` — idioma activo (en `i18n.js`)
- `LANG` — diccionario de traducciones (en `i18n.js`)
- `TACTICS_CFG`, `FORMATIONS`, `DIV_CFG` — configuración base (en `data.js`)
