# Nexi Payment Pricing Calculator (Beta)

Internes Tool für Key Account Manager, um Kunden den finanziellen Effekt eines Wechsels zu Nexi transparent vorzurechnen — statt nur einen Basispunkte-Wert in den Raum zu stellen.

## Hosting via GitHub Pages

1. Diese drei Dateien (`index.html`, `styles.css`, `calculator.js`, `nexi-logo.png`) in ein Repository hochladen.
2. Unter **Settings → Pages** als Quelle den `main`-Branch (Root) auswählen.
3. Die Seite ist danach unter `https://<username>.github.io/<repo-name>/` erreichbar.

Kein Build-Schritt, keine Abhängigkeiten — reines HTML/CSS/JS.

## Funktionsumfang (Beta)

- **Blended-Modus:** einfacher Effektivsatz-Vergleich Nexi vs. Wettbewerber auf Basis des Jahresvolumens.
- **IC++ Modus (granular):** Aufschlüsselung nach Kartenmix (Interchange + Scheme Fee je Segment, identisch für beide Seiten) plus separater Acquiring Service Fee (ASF) je Anbieter.
- **ASF mit zwei Komponenten:** variable Basispunkte und fixe Transaktionsgebühr (CHF pro Transaktion). Die Fixgebühr wird aktuell nur erfasst, aber noch nicht in die Gesamtsumme eingerechnet, da die Transaktionsanzahl noch nicht als Inputgrösse hinterlegt ist (folgt in einer späteren Version).

## Bekannte Platzhalter — vor Kundeneinsatz prüfen

Die Default-Sätze für Interchange und Scheme Fee im IC++-Modus sind **nicht geprüfte Annahmewerte**, im Tool mit einem "Platzhalter – prüfen"-Badge markiert:

| Segment | Interchange (Default) | Scheme Fee (Default) |
|---|---|---|
| Debit Consumer (EU-issued) | 0.20 % | 0.03 % |
| Credit Consumer (EU-issued) | 0.30 % | 0.04 % |
| Commercial / Business | 1.50 % | 0.06 % |
| Premium / Non-EU issued | 2.00 % | 0.08 % |

Die Debit/Credit-Consumer-Werte orientieren sich an den EU-Interchange-Caps; Commercial, Premium und Non-EU sind grobe Platzhalter ohne geprüfte Quelle. Sobald reale Nexi-Referenzsätze vorliegen, einfach im Tool überschreiben — das Badge verschwindet automatisch, sobald eine Zeile editiert wird.

## Offene Punkte für die nächste Iteration

- Transaktionsanzahl als Inputgrösse, damit die fixe ASF-Transaktionsgebühr korrekt mitgerechnet wird
- Reale Interchange-/Scheme-Fee-Referenztabelle statt Platzhalter
- Exportier-/Druckansicht für den Kundentermin (ohne Eingabe-UI-Elemente)
- Ggf. weitere Kartensegmente (z. B. getrennte Non-EU-Spalten je Kartentyp statt einer Sammelzeile)
