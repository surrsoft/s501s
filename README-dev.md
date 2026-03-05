# s501s — Train View

## Описание

Расширение для VS Code: аналог VS Code Pets. Пиксельная графика, вид из окна движущегося поезда. Отображается пейзаж, мелькают деревья, столбы, электрические провода, поля, города, станции, животные и прочее. Разные биомы, разное время суток, разная погода.

---

## Структура проекта

```
src/
├── extension.ts          — точка входа (activate/deactivate)
├── trainPanel.ts         — TrainViewProvider: создаёт webview в боковой панели
└── webview/
    ├── main.ts           — точка входа webview: canvas, acquireVsCodeApi, postMessage
    ├── renderer.ts       — TrainRenderer: игровой цикл, состояние, параллакс
    ├── layers.ts         — отрисовка слоёв (небо, холмы, земля, рельсы, рамка окна)
    ├── elements.ts       — SceneElement + функции отрисовки всех объектов
    ├── biomes.ts         — BiomeDef, Palette, ElementType, конфиги 5 биомов
    ├── timeOfDay.ts      — TimeColors, конфиги времени суток, константы цикла
    └── weather.ts        — WeatherRenderer: частицы дождя, снега, туман

media/
└── train-icon.svg        — иконка в Activity Bar

out/                      — скомпилированный extension (Node.js, CommonJS)
webview-dist/             — скомпилированный webview (браузер, ES modules)
```

---

## Архитектура

### Extension host ↔ Webview

Связь через `postMessage`:

| Направление | Тип сообщения | Данные |
|---|---|---|
| Webview → Host | `ready` | — |
| Host → Webview | `settings` | `TrainSettings` |

При старте webview шлёт `ready`, host отвечает текущими настройками. При изменении `settings.json` host снова шлёт `settings`.

### Игровой цикл (renderer.ts)

```
requestAnimationFrame
  → _update(dt)
      scrollX += speed
      biomeTimer += dt  → смена биома каждые 30 сек (lerp палитры)
      todTimer += dt    → смена времени суток каждые 2 мин
      weatherTimer += dt
      спавн/удаление SceneElement
      WeatherRenderer.update()
  → _render()
      drawSky → drawFarHills → drawMidHills → drawGround
      → far elements → mid elements → drawRail → near elements
      → WeatherRenderer.draw() → drawAmbientOverlay → drawWindowFrame
```

### Параллакс-слои

| Слой | Скорость | Что рисуется |
|---|---|---|
| Sky | статичный | градиент, солнце/луна/звёзды |
| Far hills | 0.08× | силуэт дальних холмов |
| Mid hills | 0.25× | средний горизонт |
| Ground | — | земля со stripe |
| Far elements | 0.4× | мелкие объекты вдали |
| Mid elements | 0.7× | основные объекты |
| Rail | 1× | шпалы + рельсы |
| Near elements | 1.2× | объекты переднего плана |
| Weather | поверх | дождь/снег/туман |
| Ambient | поверх | ночной/закатный tint |
| Window frame | поверх | рамка окна (статичная) |

### Биомы

| ID | Объекты |
|---|---|
| `forest` | ели, берёзы, пни, олени, грибы, заборы |
| `field` | столбы с проводами, стога, подсолнухи, коровы, заборы |
| `city` | дома, заводы, опоры мостов, столбы |
| `mountains` | скалы, заснеженные пики, ели, голые деревья |
| `tundra` | голые деревья, избушки, заборы, столбы |

Смена биома — каждые 30 секунд, переход плавный (lerp цветов палитры в последние 20% длительности).

### Время суток

Цикл: `day → sunset → night → day`, каждая фаза 2 минуты (при `auto`).

- **Day** — стандартная палитра биома, солнце
- **Sunset** — переопределяет цвет неба на оранжевый, лёгкий tint
- **Night** — тёмное небо, луна, звёзды с мерцанием, сильный tint

### Погода

- **clear** — без эффектов
- **rain** — 120 диагональных капель (`strokeStyle`)
- **snow** — 80 белых кружков с медленным падением
- **fog** — градиентный полупрозрачный overlay

---

## Сборка и запуск

### Требования

- Node.js 18+
- VS Code 1.80+

### Команды

```bash
npm install          # установить зависимости

npm run build        # собрать extension + webview
npm run build:ext    # только extension (out/extension.js)
npm run build:webview # только webview (webview-dist/webview.js)
npm run watch        # watch-режим для обоих
```

### Запуск в VS Code

1. Открыть папку проекта в VS Code
2. `F5` → запустится Extension Development Host
3. В боковой панели (Activity Bar) кликнуть иконку поезда
4. Панель откроется с анимацией

### Настройки (settings.json)

```json
{
  "train-view.speed": "normal",     // "slow" | "normal" | "fast"
  "train-view.biome": "auto",       // "auto" | "forest" | "field" | "city" | "mountains" | "tundra"
  "train-view.timeOfDay": "auto",   // "auto" | "day" | "sunset" | "night"
  "train-view.weather": "auto"      // "auto" | "clear" | "rain" | "snow" | "fog"
}
```

---

## Расширение

### Добавить новый элемент

1. Добавить имя в `ElementType` в [src/webview/biomes.ts](src/webview/biomes.ts)
2. Добавить функцию `drawMyElement(ctx, x, groundY, s)` в [src/webview/elements.ts](src/webview/elements.ts)
3. Добавить `case 'my_element':` в `drawShape()` в том же файле
4. Включить `'my_element'` в `elementPool` нужного биома

### Добавить новый биом

1. Добавить `BiomeId` в union-тип в [src/webview/biomes.ts](src/webview/biomes.ts)
2. Добавить запись в `BIOMES` с палитрой и пулом объектов
3. Добавить в `BIOME_ORDER`
4. Добавить в enum настройки в [package.json](package.json)

### Добавить PNG-спрайты

Сейчас вся графика рисуется программно через `fillRect`. Для замены на спрайты:
1. Положить PNG в `media/`
2. Передать URI через `webview.asWebviewUri()` в HTML (data-атрибут или глобальная переменная)
3. Загрузить через `new Image()` в webview и использовать `ctx.drawImage()`
