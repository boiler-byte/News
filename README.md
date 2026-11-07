# News · v4

Kleine RSS-/Atom-Leseapp mit Vanilla JavaScript, ohne Build-Schritt und ohne Anmeldung.

## Starten / installieren

1. Die **neuen und geänderten Dateien aus dem v4-ZIP** über die bestehende App (v3) kopieren. Nicht enthaltene Dateien – insbesondere `assets/newsstand.webp` und unveränderte JavaScript-Module – bleiben erhalten.
2. Die App über **HTTPS** oder einen lokalen Webserver starten, z. B. `python3 -m http.server 8000` und `http://localhost:8000` aufrufen. `file://` unterstützt keinen Service Worker.
3. Der Browser kann die App über sein Menü **Installieren** bzw. **Zum Startbildschirm** anbieten. Manifest und App-Icons sind lokal enthalten.

## Neu in v4

- Beim Abonnieren eines über **Erkunden** gefundenen Feeds sucht die App nach dem Website-Favicon (über die HTML-Icon-Links, sonst `/favicon.ico`). Unterstützte Rasterbilder sowie bereinigte SVG-Icons werden als Data-URL **im Favoriteneintrag in IndexedDB gespeichert** und als Feed-Symbol angezeigt. Schlägt die Icon-Suche fehl, bleibt das bisherige Symbol erhalten. Auch direkt hinzugefügte Feed-Adressen werden berücksichtigt.
- In **Feed-Details** erscheinen bereits besuchte Artikel-Links dunkelrot. Dies basiert auf der `:visited`-Erkennung des Browsers.
- In **Erkunden** werden bei den gefundenen Feeds die Format-Badges ausgegraut, sofern das Format **nicht Atom** ist (einschließlich Atom-Versionsangaben).
- Die App ist eine **PWA**: `manifest.webmanifest`, eigene 192/512-Pixel-Icons und `service-worker.js`. Die Benutzeroberfläche ist nach erfolgreicher Installation des Service Workers offline verfügbar. Gespeicherte Artikel und Favoriten bleiben über IndexedDB lesbar. **Neue Feed-Abfragen und Feed-Suche benötigen weiterhin Internet**, da die Quellen extern liegen.

## Unveränderte Funktionen

- Favoritenverwaltung, Feed-Suche via Feedsearch mit HTML-Fallback, direkte Feed-URLs, RSS/Atom/JSON Feed, Artikel-Cache in IndexedDB.
- Das Nachrichtenstand-Motiv und die bestehenden acht Katalogfeeds bleiben erhalten.
- RSS-Feeds werden zuerst direkt geladen; bei CORS-Problemen wird `https://proxy.cors.dev/` versucht. Der externe Proxy kann die abgerufene URL sehen.

## Neue Dateien

```text
assets/icon-192.png
assets/icon-512.png
js/favicon.js
manifest.webmanifest
service-worker.js
```

Weitere enthaltene Dateien des v4-Differenzpakets ersetzen die gleichnamigen v3-Dateien. Der Datenbankname bleibt unverändert, bestehende Favoriten werden nicht zurückgesetzt.
