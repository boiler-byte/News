# News · v3

Eine kleine RSS-/Atom-Leseapp in **HTML, CSS und Vanilla JavaScript**. Keine Bibliotheken, kein Build-Schritt, keine Anmeldung.

## Starten

1. Den Ordner `news-v3` entpacken.
2. Im Ordner einen lokalen Webserver starten, zum Beispiel:
   ```bash
   python3 -m http.server 8000
   ```
3. `http://localhost:8000` im Browser öffnen. Alternativ den Ordner auf einen statischen Webhost wie GitHub Pages legen.

> Ein Webserver ist nötig, weil Browser ES-Module beim direkten Öffnen einer `file://`-Datei oft blockieren.

## Bedienung

- Auf dem Nachrichtenstand **Favoriten** oder **Erkunden** wählen. Der mittlere Schaukasten zeigt Titel und Untertitel, die Artikel- bzw. Feed-Anzahl direkt über dem Zeitungsstapel sowie rechts unten zusätzliche Informationen (z. B. Feed-Beschreibung und letztes Aktualisierungsdatum). Die Hero-Navigation scrollt beim Wechsel nicht automatisch.
- In **Favoriten** einen Feed anklicken, um dessen Artikel zu öffnen.
- Das Herz entfernt den Feed aus den Favoriten oder fügt ihn hinzu.
- In **Erkunden** eine Website-Adresse eingeben, um mit **Feedsearch** verfügbare Feeds zu finden, und dann das Herz anklicken. Gefundene Feeds zeigen **Format und Version** (z. B. RSS 2.0, Atom 1.0, JSON Feed) und zur Unterscheidung die konkrete Feed-Adresse.
- Bei einer **direkten Feed-Adresse** (`.rss`, `.xml`, `/feed/`, etc.) wird diese sofort als Favorit angelegt.
- **Artikelüberschriften** öffnen die Originalseite in einem neuen Tab. Ein zusätzlicher „Weiterlesen“-Link wird nicht mehr angezeigt.
- Längere Anreißer können auf- und zugeklappt werden.
- Bei späteren Aufrufen stehen zuletzt geladene Artikel aus dem lokalen Cache bereit.

Beim ersten Besuch werden **heise online** und **tagesschau** als Beispielfavoriten angelegt. Danach speichert **IndexedDB** die selbst gewählten Favoriten und den letzten Artikelstand pro Feed. Entfernte Favoriten werden beim nächsten Besuch nicht automatisch neu angelegt. Feedsearch-Funde erweitern den Katalog nur während der aktuellen Sitzung; abonnierte Funde bleiben als Favoriten gespeichert.

## Technische Hinweise

- Die **Feedsearch-API** unter `https://origin.feedsearch.dev/api/v1/search` wird zur Website-Suche verwendet. Das Feld `version` liefert den Formattyp; bei fehlender Angabe wird er aus der URL oder dem Medien-Typ abgeleitet, falls möglich. Ist sie nicht erreichbar, versucht die App die RSS-/Atom-Links im HTML der Website zu finden.
- RSS-Feeds lassen sich im Browser oft nicht direkt laden, weil der Anbieter **CORS** nicht freigibt. Die App probiert zuerst einen direkten Abruf, danach den öffentlichen Proxy `https://proxy.cors.dev/`.
- Ein öffentlich betriebener Proxy ist ein **externer Dienst**. Er sieht die URL, die die App abruft. Dieser Ansatz ist für den einfachen Prototyp gedacht; für Produktivbetrieb ist ein eigener Feed-Proxy empfehlenswert.
- **Feedsearch** ist ebenfalls ein externer Dienst und kann ausfallen oder Anfragen ablehnen. Nicht jede Website veröffentlicht einen Feed.
- Unterstützt **RSS 2.0, Atom, RSS/RDF und JSON Feed**. Artikel werden als reiner Text dargestellt, um unsicheres Feed-HTML nicht in die Seite einzufügen.
- Die acht Katalogeinträge liegen statisch in `js/catalog.js`.

## Struktur

```text
news-v3/
├── index.html
├── assets/newsstand.png       # bereitgestelltes Hero-Bild
├── css/styles.css             # dunkles, responsives Layout
├── js/app.js                  # Navigation, Events und App-Zustand
├── js/catalog.js              # statischer Feed-Katalog
├── js/storage.js              # IndexedDB für Favoriten und Artikelcache
├── js/feed-reader.js          # RSS-, Atom- und JSON-Feed-Abruf
├── js/feedsearch.js           # Feedsearch-API + HTML-Fallback
├── js/feed-format.js          # Format- und Versions-Erkennung
├── js/icons.js                # lokale SVG-Icons
└── js/ui.js                   # HTML-Ansichten
```

## Alternative: Einzelne HTML-Datei

Zusätzlich liegt `news-v3.html` als eigenständige Ein-Datei-Version zum schnellen Ausprobieren vor. Sie enthält dieselben Module gebündelt sowie das Hero-Bild eingebettet. Wenn diese Datei über `file://` geöffnet wird, kann der Browser IndexedDB einschränken. Für dauerhaft gespeicherte Favoriten ist die modulare Variante über einen lokalen Server oder HTTPS die verlässlichere Wahl.
