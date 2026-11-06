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