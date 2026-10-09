# Reporting-Logik 4.1

## Welche Daten zählen?
Nur administrativ freigegebene echte Wettbewerbsofferten gehen in Kennzahlen und Trends ein. Zu prüfende Offerten bleiben separat sichtbar. Eine Bestätigung durch den Nutzer und die Freigabe sind Qualitätskontrollen, kein unabhängiger Echtheitsnachweis. Datum ist das Offertdatum. Branche, Sales Channel, Einsatzzweck und Umsatzband dienen der Einordnung; keine Kundennamen, Anhänge, exakten Umsätze oder exakten Transaktionszahlen werden gespeichert. Freitext darf nur Propositionen oder Wettbewerber benennen.

## Preise und Vergleichbarkeit
Die Bibliothek zeigt Debit Mastercard, Visa Debit/V PAY, Kredit Visa/Mastercard, TWINT, weitere Karten, CHF pro Transaktion, Terminalmiete und weitere Kosten. Split Blend enthält den jeweiligen Gesamt-Kommissionssatz. IC++ enthält die Acquirer-Marge, zuzüglich separat angenommener Interchange- und Scheme-Kosten. TWINT bleibt separat. Eine Marge darf nicht mit einem Split-Blend-Gesamtsatz gleichgesetzt werden.

Trends und Preisübersichten betreffen jeweils eine identische Vergleichsgruppe: Einsatzzweck, Branche, Sales Channel, Umsatzband und Preismodell. Monatliche Preise sind Mediane der erfassten Wettbewerbsofferten; die Stichprobengrösse ist sichtbar. Jede Wettbewerbsofferte zählt einmal, unabhängig von der Zahl der Nexi-Optionen. Fehlende Werte werden ausgeschlossen; Null ist ein tatsächlicher eingetragener Preis. Ab fünf Beobachtungen je Anbieter/Monat wird eine Trendlinie verbunden, sofern die Monate aufeinander folgen. Dies ist eine Darstellungsregel, keine statistische Repräsentativitätsgarantie. Fehlende Monate bleiben Lücken.

Das Management Summary zeigt Veränderungen in Prozentpunkten: Median der Veränderungen derselben Anbieter vom ersten zum letzten verfügbaren Monat, sofern beide Monate mindestens fünf Beobachtungen haben. Bei IC++ ist dies die Marge, nicht der vollständige Kartenpreis.

## Einheitliche Referenzkosten CH-2026-v1
Für die Marktübersicht werden Offerten mit festen fiktiven Profilen gerechnet, statt mit unterschiedlich grossen Merchants:
- <250k: CHF 125’000, 2’500 Transaktionen.
- 250k–500k: CHF 375’000, 7’500 Transaktionen.
- 500k–1m: CHF 750’000, 15’000 Transaktionen.
- 1m–2m: CHF 1’500’000, 30’000 Transaktionen.
- ≥2m: CHF 2’500’000, 50’000 Transaktionen.
Mix: 30 % Debit Mastercard, 30 % Visa Debit, 25 % Kredit, 15 % TWINT, 0 % weitere Karten. Derselbe Anteil wird für Umsatz und Transaktionen verwendet. Einrichtungskosten zählen vollständig im ersten Jahr. Miete, Anzahl Terminals, monatliche/jährliche Zusatzkosten, Mindestgebühr und variable Zuschläge werden berücksichtigt.

IC++-Referenzannahmen: Debit 0,20 % Interchange + 0,12 % Scheme; Kredit 0,40 % + 0,15 %. Diese Werte sind illustrative Annahmen, keine aktuellen offiziellen Gebühren. Sie ersetzen nicht die echten Gebühren eines Merchants. Änderungen an diesen Profilen oder Annahmen brauchen eine neue Referenzversion. Kosten sind indikativ und keine verbindliche Offerte. Der lokale Rechner verwendet weiterhin die vom Nutzer eingegebenen Merchant-Annahmen; die Reporting-Profile betreffen ausschliesslich die Auswertung der Bibliothek.

## Neukundengewinnung und Retention
Neukundengewinnung: Vergleich mit der günstigsten vollständig berechenbaren Nexi-Option des jeweiligen Falls. Das ist eine Simulation, keine Abschlussquote.
Retention: Vergleich nur mit der tatsächlich als angeboten ausgewählten Nexi-Proposition. Ohne Zuordnung kein gepaarter Preisvergleich. Haltequote = gehalten / (gehalten + verloren); offene Fälle zählen nicht in den Nenner. Auswertung nach benannter Proposition und Segment. Die beobachtete Quote beweist keine kausale Wirkung des Preises.

Kostenvorteil = (Wettbewerbskosten − Nexi-Kosten) / Wettbewerbskosten. Positiv bedeutet Nexi günstiger; negativ bedeutet Wettbewerber günstiger. Bei Wettbewerbskosten Null ist der relative Vorteil nicht definiert. Aggregierte Vorteile sind Mediane einzelner Fallvergleiche.

## Demo und PDF
Demo-Daten sind deterministische Fiktion für alle auswählbaren Wettbewerber inklusive Other/DemoPay. Sie sind keine Marktbeobachtung und werden nie in die Datenbank geschrieben. Sie ersetzen die echte Ansicht nur lokal, bis zurückgeschaltet wird. Jede PDF-Seite trägt eine Demo-Kennzeichnung. Namen/Logos kennzeichnen die fiktiven Anbieterbeispiele, keine tatsächlich angebotenen Preise.

PDF enthält Summary, Detailanalyse und höchstens sechs Offerten aus der aktuell gewählten Bibliotheksseite. Die vollständige Bibliothek bleibt über Filter und Seitenwechsel erreichbar. Die Auswertung lädt höchstens 5’000 Datensätze; bei Erreichen dieses Limits wird angezeigt, dass der Zeitraum enger gewählt werden muss.

## Grenzen
Erfasste Offerten sind eine selektive Stichprobe, keine repräsentative Marktstatistik. Vergleichsgruppen reduzieren Unterschiede, gleichen aber z. B. Vertragsdauer, Herkunftsmix, Kartentypen und individuelle Nebenbedingungen nicht vollständig aus. Bestehende Offerten ohne Branche werden als „nicht erfasst“ geführt. Monatliche PDF-E-Mails und revisionssichere Berichtssnapshots sind noch nicht implementiert.
