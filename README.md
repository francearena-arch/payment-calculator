# Nexi Payment Vergleichsrechner · v3.4

`index.html` im Browser öffnen. Eingaben bleiben lokal.

## Geschäftszahlen und Mix
- Zahlungsumsatz und Anzahl Transaktionen umfassen Karten und TWINT.
- Der sichtbare Zahlungsartenmix startet als **Beispielannahme**: Debit Mastercard 30 %, Visa Debit 30 %, Kreditkarten 25 %, TWINT 15 %, weitere Karten 0 %. Er ist vor einer Merchant-Weitergabe anzupassen und abzugleichen.
- Prozentsätze werden mit dem Umsatzanteil jeder Zahlungsart gewichtet. Ohne separate Transaktionszahlen werden Fixbeträge pro Transaktion unter der ausdrücklich genannten Annahme berechnet, dass die Transaktionsanteile den Umsatzanteilen entsprechen.
- Unter „Zahlungsartenmix anpassen“ kann man optional Transaktionen je Zahlungsart separat erfassen. Die Summe muss der Gesamtzahl entsprechen.
- Mix, Status der Bestätigung und gegebenenfalls Transaktionszahlen stehen in der PDF-Berechnungsbasis.

## Preismodelle
Split Blend: separater Satz und optionaler Fixbetrag für Debit Mastercard, Visa Debit, Kredit Visa/Mastercard, TWINT und weitere Karten. IC++: Acquirer-Marge plus angenommene Interchange und Netzwerkgebühren für Karten; TWINT separat. Terminalmiete, weitere Fixkosten und Zuschläge je Angebot ergänzen.

Alle vorgegebenen Mix- und IC++-Gebührensätze sind editierbare Schätzwerte. Erst auf Knopfdruck geladene Angebotssätze sind Demo-Werte, keine verbindlichen Nexi-Konditionen. Preis- und Vertragsbedingungen fachlich prüfen. Umsatz-Szenarien beruhen auf groben Stichproben, nicht auf exakten Schwellenwerten.
