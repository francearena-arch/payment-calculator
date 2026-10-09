# Frontend-Audit – 4.0.0-rc.3

Prüfumfang: vorhandener Release-Code, lokal gebaute Oberfläche, Chromium-Browserprüfungen, visuelle Prüfung Desktop/Mobile/Login/Reporting und gerenderte A4-PDFs. Kein erneuter Zugriff auf echte Konten oder die produktive Datenbank.

## Befunde und Änderungen
- Aktive Navigation kenntlich gemacht; konsistente Haupt- und Nebenaktionen, Fokusmarkierungen, ausreichende Touchflächen.
- Ruhigere Kopfzeile und weniger doppelte Einleitung, konsistente Eingabefelder und Abstände.
- Mobile Kontextfelder untereinander; Zahlungsraten bei ausreichender Breite nebeneinander; vier Angebote am Desktop in zwei Spalten.
- Pflichtangaben kenntlich, feldbezogene rote Hinweise, Fokus zur ersten fehlenden Angabe und Öffnen betroffener Detailbereiche. Fehler nicht ausschliesslich über Farbe vermittelt.
- Mixbestätigung direkt sichtbar. Technische Zusatzannahmen bleiben eingeklappt.
- Wettbewerbsauswahl und Bibliothek-Einreichung nur im Wettbewerbsmodus sichtbar. Interne Vergleiche bleiben lokal.
- Bibliothekseinreichung als optionaler, separater Schritt beschrieben; erfolgreiche Einreichung und laufende Verarbeitung erkennbar.
- Erneuter Vergleich vor Datenverlust bestätigt. Bei Backendfehlern bleiben Eingaben erhalten.
- Sprachwechsel bewahrt Echt-Offerte-Bestätigung und den aktiven Navigationsbereich; Reporting wird in aktueller Sprache neu aufgebaut.
- Nutzerstatus übersetzt, Preismodellwerte im Reporting lesbar (Split Blend / IC++).
- Bei Kostengleichheit keine irreführende Einzelgewinner-Empfehlung, auch in Umsatzszenarien.
- Einheitliche Druckgestaltung, Vergleich weiterhin mit Übersicht und Detailseite.

## Verifikation
13 Unit-/Berechtigungs-/Berechnungstests bestanden. Browserprüfungen mit simuliertem Benutzer und Administrator bestanden: fehlende Felder, Korrektur, erfolgreiche Einreichung, Demo-Sperre, Spracherhalt, Navigation und Reporting. Breiten 320, 375, 390, 768, 1024 und 1440 ohne Seitenüberlauf im geprüften Vergleich. Login mobil visuell geprüft. Vergleichs-PDF (2 Seiten) und Reporting-PDF visuell geprüft.

## Grenzen
Keine universelle Usability-Garantie aus automatisierten Prüfungen. Browserprüfungen verwenden simulierte Authentifizierung und API-Antworten. Echte Supabase-Einreichung/Freigabe nach Deployment noch prüfen. IC++ weiterhin indikativ mit offengelegten Annahmen. Report basiert auf beobachteten Offerten, nicht repräsentativen Marktpreisen. Keine Änderung an Berechnungsgebühren, DB-Schema oder Berechtigungsmodell. Automatische Monatsmails nicht eingerichtet. SumUp weiterhin Text statt offiziell freigegebenem Logo.
