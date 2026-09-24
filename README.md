# Nexi Payment Vergleichsrechner · v3.3

`index.html` im Browser öffnen. Eingaben bleiben lokal.

## Bedienung
- Zwei oder drei Nexi-Angebote oder Nexi gegen Wettbewerb vergleichen.
- Je Angebot zwischen Split Blend und IC++ wechseln.
- Split Blend: Debit Mastercard, Visa Debit/V PAY, Kredit Visa/Mastercard und TWINT separat eingeben; weitere Karten und Fixbeträge pro Zahlung sind aufklappbar. Preisfelder bleiben leer, bis Konditionen eingegeben oder bewusst ein Beispiel geladen werden.
- IC++: Markup für Kartenzahlungen und separater TWINT-Satz; angenommene Interchange und Netzwerkgebühren sind im aufklappbaren Zahlungsartenmix editierbar.
- PDF: Empfehlung auf Seite 1, Kostenblöcke und die verwendeten Sätze samt Mix auf Seite 2.

## Berechnung und Grenzen
Umsatzanteile je Zahlungsart verteilen den Gesamtumsatz. Transaktionen werden proportional zum Umsatzanteil verteilt, da keine getrennten Transaktionszahlen erfragt werden. Split Blend rechnet Satz und optionalen Fixbetrag je Zahlungsart. IC++ rechnet Markup, Interchange und Netzwerkgebühren für Karten; TWINT separat. Dazu kommen erfasste Zusatzkosten, Miete und anteilige Einrichtung. Die Umsatz-Szenarien sind Stichproben, keine exakten Schwellenwerte. Voreingetragener Zahlungsartenmix und IC++-Gebühren sind illustrative Annahmen; Konditionen und tatsächlichen Mix mit dem Merchant prüfen. Demo-Sätze sind ausdrücklich keine Nexi-Tarife.
