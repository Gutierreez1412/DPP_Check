# PROJEKT: DPP-Betroffenheitscheck

Briefing für Claude Code. Diese Datei zuerst lesen, bevor etwas gebaut oder geändert wird.

## 1. Ziel

Eine Website, mit der Unternehmen einschätzen, wie stark sie vom
Digitalen Produktpass (DPP) bzw. der ESPR und verwandten Produktverordnungen betroffen sind.
Abhängig von den Antworten landen Nutzer auf unterschiedlichen Seiten.

Das Tool liefert **Einschätzungen und Scores, keine Rechtsberatung und keine
Konformitätsnachweise**. Das muss in Texten und Disclaimern erkennbar sein.

Kooperationsprojekt mehrerer Partner (u. a. Future Response, Berlin); auf der Seite wird kein einzelner Partner als Betreiber genannt. Zielgruppe: regulierungsbetroffener Mittelstand im DACH-Raum.

## 2. Leitprinzipien

1. **Inhalt gehört in Konfigurationsdateien, nicht in den Code.** Fragen, Antworten, Scores,
   Ampel-Schwellen, Zeitstrahl, FAQ, Erklärtexte, Pilot-Beispiele: alles in JSON-Dateien.
   Änderungen sollen ohne Eingriff in den Code möglich sein.
2. **Statische Website, kein Backend.** Muss später leicht auf eine bestehende Website
   umziehbar sein (GitHub-Repo, Hosting z. B. GitHub Pages, Netlify oder Vercel).
3. **Zweisprachig: Deutsch und Englisch** mit Sprachumschalter. Alle Texte liegen pro Sprache
   in den Konfigurationsdateien.
4. **Nutzer ohne Programmierkenntnisse.** Änderungen erklären, kurz und in einfachem Deutsch.
   Vor größeren Umbauten Rückfrage. Nach jeder Änderung die Seite lokal startbar halten.
5. **Quellenprinzip.** Jede inhaltliche Aussage im Zeitstrahl, in den FAQ und in den
   Erklärtexten bekommt ein Feld `quelle` mit Link. Nur **offizielle Quellen** verwenden
   (EUR-Lex, EU-Kommission, offizielle Behörden- und Gremienseiten). Nichts erfinden,
   Fristen nicht schätzen. Wenn eine Angabe nicht belegbar ist: als `"status": "unklar"`
   markieren und im Chat melden.
6. **Datenschutz.** Antworten und Ergebnis werden nur beim Absenden des Kontaktformulars
   mitgeschickt. Sonst nichts speichern, kein Tracking, keine Cookies für Auswertung.

## 3. Seitenstruktur (4 Ebenen)

### Ebene 1: Filter (`/`)

Drei Schritte, je ein Bildschirm, mit Fortschrittsanzeige:

1. **Produktgruppen** wählen (Mehrfachauswahl): Batterien, Stahl, Textil, Möbel, Bauprodukte
2. **Ja/Nein:** Verkaufst du Produkte unter deinem eigenen Namen?
3. **Ja/Nein:** Veränderst du Produkte wesentlich?

Aus den Antworten zu Schritt 2+3 wird eine **Rolle** ermittelt (Art. 34 ESPR) und als
Hinweisbox ganz oben auf der Ebene-2-Landingpage angezeigt (`?rolle=…` in der URL):

- Eigener Name/Marke = Ja → **könnte als Hersteller gelten** (Art. 34 lit. a, Pflichten
  nach Art. 27) – Konjunktiv, da die konkrete DPP-Pflicht vom jeweiligen delegierten
  Rechtsakt der Produktgruppe abhängt
- Eigener Name = Nein, Veränderung = Ja → **könnte Herstellerverantwortung erhalten haben**
  (Art. 34 lit. b; Screening-Frage für „Veränderung beeinträchtigt Konformität“, echte
  Bewertung nur im Einzelfall möglich, Status `unklar`)
- Beides Nein → **bliebe voraussichtlich Importeur/Vertreiber** (Sorgfaltspflichten nach
  Art. 29/30 ESPR)

Weiterleitung wie gehabt: bei einer Produktgruppe direkt zur Landingpage (mit Rolle in der
URL), bei mehreren Gruppen zuerst eine Übersicht mit einem Link pro Gruppe (Rolle wird an
jeden Link weitergereicht).

(Löst den früheren TODO-Punkt „Sonderfall zweimal Nein“: Alle drei Rollen führen weiter
in den normalen Ablauf, kein Abbruch/Sackgasse mehr.)

### Ebene 2: Landingpage je Produktgruppe (`/gruppe/<id>`)

- Definition: Was fällt in diese Produktgruppe?
- **Zeitstrahl** mit nächsten Meilensteinen („ab wann gilt was“)
  - Je Meilenstein: Datum, Titel, Kurzbeschreibung (1-2 Sätze), Quelle
- **FAQ** (individuell pro Gruppe)
- **ESPR/DPP-Grundlagen**: zentral einmal geschrieben (`inhalte/grundlagen.json`),
  auf allen Landingpages gleich eingebunden
- **Button** „Umfang der Betroffenheit berechnen“ führt zu Ebene 3

### Ebene 3: Check und Ergebnis (`/check/<id>` und `/ergebnis/<id>`)

- ca. **8-10 Detailfragen** pro Produktgruppe
- Nur **Einfachauswahl**: Jede Antwort hat einen festen Score
- Gesamtscore = Summe der Scores. Ampel über Schwellen (siehe TODO, Platzhalter nutzen)
- Ergebnisseite zeigt:
  - Ampel mit **Erklärtext je Farbe** („Was bedeutet das für mich?“)
  - **Empfohlene nächste Schritte** (je Ampelfarbe)
  - **Kontaktformular** (im Prototyp nur Attrappe, ohne Versand). Beim Absenden sollen
    Produktgruppe, alle Antworten, Gesamtscore und Ampelfarbe als Felder mitgehen.
  - Link zum DPP-Pilot (Ebene 4)
- Der Gesamtscore und die Punkte je Frage werden **nicht** angezeigt.
- Nach der Tacho-Animation rückt das Ergebnis nach links, rechts erscheint pro Frage eine
  **Begründung** in zwei Blöcken (Feld `bereich` in `fragen.json`): „Rahmenbedingungen“
  (Portfolio, Lieferkette, Startpunkt) und „Produktdaten“ (Auswahl an Datenpunkten). Je
  Frage: Stufe (Niedrig/Mittel/Hoch, Schwellen `schwellen_je_frage` in `ampel.json`), ein
  Fakt zur Anforderung (`fakt`, ausschließlich aus der Rechtsgrundlage der
  Produktgruppe) und ein Satz, was das bei dieser Stufe für den Aufwand bedeutet
  (`aufwand` je Frage bzw. `daten_aufwand` für alle Datenfragen), als ein Absatz mit
  Artikel und Quelle am Ende. Zugeklappt sind nur Kategorie und Stufe sichtbar, die
  Begründung öffnet sich per Klick
  (`inhalte/gruppen/<id>/begruendungen.json`).
- Mehrere Produktgruppen: Check läuft pro Gruppe separat.

### Ebene 4: DPP-Pilot (`/pilot/<id>`)

Je Produktgruppe ein eigenes Beispiel, jeweils mit zwei Ansichten:

- **Endkunden-Ansicht:** Beispiel-Produktpass nach QR-Code-Scan (Produktdaten, Material, Herkunft usw.)
- **Unternehmenssicht:** welche Daten wer einpflegt und wie sie im Pass landen

Beispieldaten sind fiktiv und als Beispiel gekennzeichnet.

## 4. Ordnerstruktur (Vorschlag)

```
/
├── PROJEKT.md
├── README.md                  (Start- und Änderungsanleitung in einfachem Deutsch)
├── inhalte/                   (alles, was der Nutzer ändert)
│   ├── seite.json             (Navigation, Disclaimer, Button-Texte, de + en)
│   ├── grundlagen.json        (zentrale ESPR/DPP-Erklärungen, de + en)
│   ├── filter.json            (Ebene 1: Produktgruppen, Ja/Nein-Fragen)
│   ├── ampel.json             (Schwellen, Farben, Erklärtexte, nächste Schritte)
│   └── gruppen/
│       ├── batterien/
│       │   ├── gruppe.json    (Definition, Zeitstrahl, FAQ)
│       │   ├── fragen.json    (Detailfragen mit Scores)
│       │   └── pilot.json     (Beispiel-Pass: Endkunde + Unternehmen)
│       ├── stahl/
│       ├── textil/
│       ├── moebel/
│       └── bauprodukte/
├── src/                       (Code: Seiten, Komponenten, Scoring-Logik)
└── public/
```

Die Scoring-Logik im Code liest nur die JSON-Dateien. Neue Produktgruppe = neuer Ordner
unter `inhalte/gruppen/` plus Eintrag in `filter.json`.

## 5. Datenformate (Beispiele)

### Zeitstrahl-Meilenstein (`gruppe.json`)

```json
{
  "id": "textil",
  "name": { "de": "Textil", "en": "Textiles" },
  "definition": { "de": "…", "en": "…" },
  "zeitstrahl": [
    {
      "datum": "2027-01-01",
      "titel": { "de": "Beispiel-Meilenstein", "en": "Example milestone" },
      "beschreibung": {
        "de": "Kurzbeschreibung in 1-2 Sätzen.",
        "en": "Short description."
      },
      "status": "geplant",
      "quelle": "https://eur-lex.europa.eu/…"
    }
  ],
  "faq": [
    {
      "frage": { "de": "…", "en": "…" },
      "antwort": { "de": "…", "en": "…" },
      "quelle": "https://…"
    }
  ]
}
```

`status`: `gilt` | `geplant` | `unklar`

### Detailfrage mit Scoring (`fragen.json`)

```json
{
  "gruppe": "textil",
  "fragen": [
    {
      "id": "q1",
      "text": {
        "de": "Wie viele Produktvarianten bringst du pro Jahr auf den Markt?",
        "en": "…"
      },
      "antworten": [
        {
          "id": "a",
          "text": { "de": "Weniger als 50", "en": "…" },
          "score": 1
        },
        { "id": "b", "text": { "de": "50 bis 500", "en": "…" }, "score": 2 },
        { "id": "c", "text": { "de": "Mehr als 500", "en": "…" }, "score": 4 }
      ]
    }
  ]
}
```

Hinweis: Das ist nur ein Formatbeispiel. Die echten Fragen und Scores werden gemeinsam
mit dem Nutzer erarbeitet (siehe Abschnitt 7).

### Ampel (`ampel.json`)

```json
{
  "schwellen": { "gruen_max": 4, "gelb_max": 10 },
  "stufen": {
    "gruen": {
      "titel": { "de": "…", "en": "…" },
      "erklaerung": { "de": "…", "en": "…" },
      "naechste_schritte": [{ "de": "…", "en": "…" }]
    },
    "gelb": { "titel": {}, "erklaerung": {}, "naechste_schritte": [] },
    "rot": { "titel": {}, "erklaerung": {}, "naechste_schritte": [] }
  }
}
```

Regel: Score ≤ `gruen_max` = Grün, ≤ `gelb_max` = Gelb, darüber = Rot.
**Die Werte hier sind Platzhalter** (siehe TODO). Schwellen können je Gruppe überschrieben werden,
falls in `fragen.json` ein Feld `schwellen` steht.

## 6. Technische Vorgaben

- Statische Seite, empfohlen: **Astro** (alternativ reines HTML/JS/Vite). Claude Code wählt,
  begründet die Wahl kurz und hält es einfach.
- Sprache über Sprachumschalter, Standard Deutsch. URL-Schema z. B. `/de/…` und `/en/…`.
- Responsive (Mobile zuerst), barrierearm (Kontraste, Tastatur, sinnvolle Labels).
- Zustand der Antworten nur im Browser (kein Speichern). Kein Tracking.
- Kontaktformular: Attrappe, aber so gebaut, dass später ein Dienst (z. B. Netlify Forms,
  Formspree) oder ein bestehendes Formular angebunden werden kann. DSGVO-Einwilligung und
  Verweis auf Datenschutzerklärung als Platzhalter einplanen.
- Ein Befehl zum Starten, ein Befehl zum Bauen. Beides in der `README.md` erklären.
- Git: kleine, aussagekräftige Commits auf Deutsch. Änderungen an Inhalten und Code getrennt committen.

## 7. Arbeitsweise und Reihenfolge

1. Repo-Grundgerüst, Ordnerstruktur, Sprachumschalter, Platzhalter-Design
2. Ebene 1 mit `filter.json`
3. Ebene 2 für **eine** Produktgruppe komplett (Vorlage), dann die anderen vier
4. Ebene 3: Scoring-Logik, Ampel, Ergebnisseite, Formular-Attrappe
5. Ebene 4: Pilot-Beispiel für **eine** Gruppe, dann die anderen
6. Inhalte: Claude recherchiert Entwürfe (Zeitstrahl, FAQ, Erklärtexte, Fragen und Scores,
   Pilot-Daten) nur aus **offiziellen Quellen**, markiert Unsicheres und lässt den Nutzer prüfen.
   Fragen und Scores sind Vorschläge, der Nutzer entscheidet.
7. Pro Schritt kurz zeigen, was sich geändert hat, und Feedback einholen.

## 8. TODO / Offene Punkte

- [x] **Zweimal „Nein“ bei den Rollenfragen:** Gelöst durch die Rollen-Ergebnisseite
      (`/rolle/`, siehe Abschnitt 3, Ebene 1) auf Basis von Art. 34 ESPR. Betrifft jetzt alle
      drei Rollen-Ausgänge (Hersteller / möglicherweise Hersteller / Importeur-Vertreiber),
      nicht nur den Zweimal-Nein-Fall. Kein Abbruch mehr – alle Rollen führen weiter zur
      Landingpage.
- [x] **Ampel-Schwellen:** Aus „Finale Regel.xlsx“ übernommen: Niedrig/Grün 0–5,
      Mittel/Gelb 6–11, Hoch/Rot 12–24 (`inhalte/ampel.json`).
- [x] **Fragenkatalog (V1):** 8 Fragen aus „Finale Regel.xlsx“, zunächst ein zentraler
      Katalog für alle Gruppen (`inhalte/fragen.json`). Gruppenspezifische Änderungen
      können folgen. Englische Fassung ist ein Entwurf von Claude, Prüfung durch Nutzer.
- [ ] **Antwortskala „Stand der Daten“ schärfen (Fragen 3, 4, 5, 6, 8):** Die Antwort
      „Für die meisten Produkte“ (1 Punkt) ist von „Nur teilweise“ (2 Punkte) nicht klar
      abgegrenzt. Vorschlag: 0 = „Ja, für alle Produkte vollständig“, 1 = „Für die meisten
      Produkte (mehr als die Hälfte)“. Vorerst unverändert wie in der Excel.
- [ ] **Ergebnisseite ausbauen:** Längerer Erklärtext je Stufe („Was bedeutet das für
      mich?“) und 2–4 nächste Schritte (`naechste_schritte` in `ampel.json`, aktuell leer).
      Link zum DPP-Pilot (Ebene 4), sobald vorhanden.
- [ ] **Check für weitere Gruppen:** Check und Ergebnis sind nur für Gruppen mit eigener
      `gruppe.json` freigeschaltet (aktuell Batterien).
- [x] **Design-Vorgabe:** Erste Design-Richtung mit dem Nutzer abgestimmt (redaktionell, ruhig,
      Kachel-Auswahl statt Checkboxen/Radios) – siehe `src/styles/global.css`. Feinschliff/
      Branding kann noch folgen, Farben bleiben zentrale Variablen (leicht austauschbar).
- [ ] **Fragenkataloge und Scores** je Produktgruppe: Entwurf durch Claude, Prüfung durch Nutzer.
- [ ] **Zeitstrahl, FAQ, Erklärtexte, Pilot-Beispiele:** Entwurf aus offiziellen Quellen, Prüfung durch Nutzer.
- [ ] **Kontaktformular:** Anbindung (Dienst, Empfänger, DSGVO-Texte) beim Umzug auf die Zielwebsite.
      Stand: Beratungsformular auf der Produktgruppen-Seite per `mailto:` umgesetzt
      (`src/components/Beratungsformular.astro`).
- [ ] **Echte Empfänger-Mailadresse** für Terminanfragen eintragen: aktuell Platzhalter
      `beratung@example.com` in `inhalte/seite.json` (`beratung.empfaenger`).
- [ ] **Datenschutzerklärung und Impressum:** Platzhalter, echte Texte vom Betreiber.
      Im Beratungsformular steht im Einwilligungstext noch „Datenschutzerklärung: folgt“ –
      dort den Link zur echten Datenschutzerklärung einsetzen (`beratung.einwilligung` in
      `inhalte/seite.json`).
- [ ] **Schriften selbst ausliefern (vor Livegang):** `src/styles/global.css` lädt Newsreader und
      Public Sans von Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Dabei geht die
      IP-Adresse der Besucher an Google, datenschutzrechtlich heikel (siehe Leitprinzip 6).
      Für den Pilot bewusst so belassen. Vor einem öffentlichen Livegang auf selbst gehostete
      Schriftdateien (z. B. in `public/fonts/`) umstellen.
- [x] **Check-Ergebnis ins Beratungsformular:** Häkchen „Ergebnis mitsenden“ auf der
      Ergebnisseite (standardmäßig aus). Antworten werden im Adress-Anker (`#a=…`)
      übergeben, der nie an einen Server geht.

## 9. Entscheidungen im Überblick (Stand: Interview)

| Thema               | Entscheidung                                                                 |
| ------------------- | ---------------------------------------------------------------------------- |
| Produktgruppen (V1) | Batterien, Stahl, Textil, Möbel, Bauprodukte                                 |
| Rollenfragen        | Zwei Ja/Nein-Fragen (eigener Name, wesentliche Änderung)                     |
| Ebene 1 Ablauf      | Schritt für Schritt, eine Frage pro Bildschirm, Fortschrittsanzeige          |
| Auswahl             | Mehrfachauswahl, Übersicht mit Link je Gruppe                                |
| Landingpage         | Definition, Zeitstrahl, FAQ, zentrale ESPR/DPP-Grundlagen, Check-Button      |
| Meilenstein         | Datum, Titel, Kurzbeschreibung (plus Quelle und Status technisch)            |
| Fragen              | 8-10 pro Gruppe, nur Einfachauswahl, fester Score                            |
| Ergebnis            | Ampel, Erklärtext je Farbe, nächste Schritte, Kontaktformular                |
| Formular            | Attrappe im Prototyp, Antworten und Ergebnis gehen nur mit dem Formular raus |
| Pilot               | Je Gruppe ein Beispiel, Endkunden- und Unternehmenssicht                     |
| Sprachen            | Deutsch und Englisch mit Umschalter                                          |
| Inhalte             | Entwurf durch Claude, nur offizielle Quellen, Prüfung durch Nutzer           |
| Speicherung         | Nichts außer beim Absenden des Formulars                                     |
