# News

Erstelle mir eine RSS-Feed HTML, die so simpel wie möglich aufgebaut ist.
Die App besteht aus einem Hero-Bild, dass auch gleichzeitig die Navigation ist und den Bereichen "Favoriten", "Entdecken" und "Feed" (Liste der News eines bestimmten Feeds).

Name der App: "News".

## Hero-Navigation
- Das Bild vom Nachrichtenstand hat 3 Aussparungen für Titel (oben), Favoriten (links), Erkunden (rechts).
- Es gibt keine Topbar und keine unnötigen Texte.

## Favoriten
- Zeigt Kacheln der Feeds (bspw. Heise).
    - Der Herz-Button entfernt den Feed aus der Liste.
- Mit einem Klick auf eine Kachel erscheinen die einzelnen Nachrichten mit Textanreißer.
    - Längere Texte werden eingeklappt.
    - Ein Klick auf den Titel oder "weiter lesen" öffnet die Quell-Seite in einem neuen Tab.

## Erkunden
- Zeigt populäre Feeds aus dem Katalog
    - Der Katalog besteht für den Anfang nur aus einer statischen Liste (siehe ## Katalog)
    - Die Feeds des Katalogs werden
- Website oder Feed hinzufügen
    - Mit Hilfe von feedsearch aus Website URLs den Katalog (flüchtig) erweitern um gefundene Feed URLs.
    - Fügt man eine Feed URL hinzu, ist sie direkt ein Favorit.

## Katalog
[
    { id: 'tagesschau', name: 'tagesschau', category: 'Nachrichten', description: 'Die wichtigsten Meldungen aus Deutschland und der Welt.', url: 'https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml', website: 'https://www.tagesschau.de/', tone: 'rose', icon: 'newspaper' },
    { id: 'heise', name: 'heise online', category: 'Technologie', description: 'IT, Digitales, Forschung und die Tech-Welt im Blick.', url: 'https://www.heise.de/newsticker/heise-atom.xml', website: 'https://www.heise.de/', tone: 'orange', icon: 'cpu' },
    { id: 'netzpolitik', name: 'netzpolitik.org', category: 'Gesellschaft', description: 'Digitale Freiheitsrechte, Netzpolitik und Datenschutz.', url: 'https://netzpolitik.org/feed/', website: 'https://netzpolitik.org/', tone: 'purple', icon: 'shield' },
    { id: 'deutschlandfunk', name: 'Deutschlandfunk', category: 'Nachrichten', description: 'Aktuelle Nachrichten mit Hintergrund und Einordnung.', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss', website: 'https://www.deutschlandfunk.de/', tone: 'blue', icon: 'radio' },
    { id: 'wissen', name: 'tagesschau Wissen', category: 'Wissen', description: 'Forschung, Wissenschaft und neue Erkenntnisse.', url: 'https://www.tagesschau.de/wissen/index~rss2.xml', website: 'https://www.tagesschau.de/wissen/', tone: 'forest', icon: 'atom' },
    { id: 'kultur', name: 'DLF Kultur · Bücher', category: 'Kultur', description: 'Bücher, Literatur und Geschichten aus der Kulturwelt.', url: 'https://www.deutschlandfunkkultur.de/buecher-108.rss', website: 'https://www.deutschlandfunkkultur.de/', tone: 'plum', icon: 'book' },
    { id: 'bbc', name: 'BBC World News', category: 'International', description: 'Internationale Schlagzeilen aus aller Welt (Englisch).', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', website: 'https://www.bbc.com/news/world', tone: 'red', icon: 'globe' },
    { id: 'guardian', name: 'The Guardian · World', category: 'International', description: 'Weltweite Nachrichten und Reportagen (Englisch).', url: 'https://www.theguardian.com/world/rss', website: 'https://www.theguardian.com/world', tone: 'gold', icon: 'globe' }
  ];

## Technik
- HTML, Vanilla JavaScript.
- Modular aufgeteilt.
- Dunkles Design, angepasst an das Hero-Bild
- indexeddb

Gib mir das Ergebnis als v1.

## Bereichstitel
- Die Überschrift aus section-heading in den mittleren Kasten im Hero-Bild verschieben.

## Feed Ansicht
- Den Link "Weiterlesen" aus der Kachel entfernen.

## Website URL
- golem.de hat eine ziemlich große Liste an Feeds, die zum großen Teil alle identisch aussehen. Es sollte noch die Info über den Feed-Typ mit rein (rss,atom,...).

Gib mir die geänderten Dateien als v2.


## Hero-Section

- Platziere auch die restlichen section-heading Infos im Schaukasten.
    - Feed Ansicht:
        - "tagesschau" (ist gut platziert)
        - "Nachrichten" (Untertitel)
        - "40 Artikel" (direkt auf dem Zeitungsstapel platzieren und größer darstellen)
        - Rechtsunten im Schaukasten:
            - Die wichtigsten Meldungen aus Deutschland und der Welt. (Beschreibung)
            - Stand 06. Nov. 2026, 19:02
    - Erkunden:
        - "Neue Quellen Entdecken" (Untertitel)
        - "Beliebte Feeds" (rechtsunten im Schaukasten platzieren)
        - Die Anzahl der beliebten Feeds größer und direkt auf dem Zeitungsstapel platzieren).
    - Favoriten:
        - "Deine Quellen" (Untertitel)
        - "3 Feeds" (Auf dem Zeitungsstapel platzieren)
- Die Buttons in der Hero-Section sollen das Bild beim Klick nicht scrollen.

Gib mir die geänderten Dateien als v3.

## Feeds
- Beim Hinzufügen gefundener Feeds das Fav-Icon der Seite, wenn vorhanden, in indexeddb speichern, als Feed-Symbol verwenden.

## Feed Detail Ansicht
- Besuchte Links dunkelrot färben.

## Erkunden
- Bei gefundene Newsfeeds, das Format-Badge ausgrauen, wenn es nicht "Atom" ist.

## PWA
- Mach die App zu einer PWA.

Gib mir nur die neuen und geänderten Dateien als v4.