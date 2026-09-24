# Nexi Payment Advisor · Prototyp

Statische Web-App: `index.html` im Browser öffnen. Keine Installation, keine Übermittlung der Eingaben.

## Ablauf
1. Kartenumsatz, Transaktionen und Betrachtungsdauer eingeben.
2. Angebote frei hinzufügen; Anbieter und Preismodell je Angebot unabhängig wählen.
3. Blended: gesamten Basis-Satz erfassen. IC++: Acquirer Markup erfassen und gemeinsamen Kartenmix bestätigen.
4. Terminalmiete, Gebühren, Mindestgebühr, Einrichtung und zusätzliche Kosten je Angebot erfassen.
5. Kostenranking, grobe Umsatz-Szenarien und Kostenblöcke prüfen; über Browserdruck als PDF speichern.

## Methodik und Grenzen
Jahreskosten = Acquiring (Umsatz × Basissatz plus IC/Scheme bei IC++; Transaktionen × Fixgebühr) + Aufpreis auf monatliche Acquiring-Mindestgebühr + zusätzliche variable Zuschläge + Terminalmiete + sonstige laufende Kosten + einmalige Einrichtung geteilt durch Betrachtungsjahre. Alle Angebote nutzen denselben Kartenmix. Die Umsatz-Szenarien nutzen acht Stichproben und halten den Bon konstant. Die IC- und Scheme-Werte des Mixes sind bewusst nur editierbare Illustrationen, keine aus den komplexen Quelltabellen abgeleiteten Durchschnittssätze. Auch Demo-Angebotssätze sind erfunden und erst nach explizitem Klick sichtbar. Individuelle Nexi-Vertragsbedingungen, Preislisten-Zuschläge und Wettbewerbsangebote müssen manuell überprüft werden. In der PDF-Druckansicht sind die Kosten, der Szenariovergleich und Einschränkungen enthalten. Dieser Prototyp ersetzt keine fachliche Tariffreigabe.
