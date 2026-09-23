# Nexi Payment Insights — Kostenvergleich

Statische, responsive Web-App ohne externe Abhängigkeiten. `index.html` im Browser öffnen oder die Dateien auf einem statischen Host bereitstellen.

## Eingaben

Jahresumsatz und Transaktionszahl; pro Angebot Blended-Gesamtsatz oder IC++-Acquirer-Marge, Fixgebühr je Transaktion und jährliche Fixkosten. Bei IC++ zusätzlich ein gemeinsamer Umsatzmix mit Interchange- und Scheme-Satz je Segment. Nicht erhobene Fixgebühren explizit mit 0 eingeben. Das Beispiel wird nur auf Klick geladen und ist frei erfunden; es ist kein Preisangebot und keine Referenztabelle.

## Berechnung

Blended = Umsatz × Gesamtsatz / 100 + Transaktionen × Fixgebühr + jährliche Fixkosten.

IC++ = Umsatz × (Acquirer-Marge + gewichteter Interchange- und Scheme-Satz) / 100 + Transaktionen × Fixgebühr + jährliche Fixkosten.

Kartenmix muss 100 % ergeben. Für beide Angebote gelten dieselben durchgereichten Gebühren; dies ist eine vereinfachende Annahme und kann bei unterschiedlichem Scheme- oder Vertragsumfang falsch sein. Es werden nur eingegebene Positionen verglichen. MwSt., Terminalkosten, Aktivierung, Mindestumsatz, Chargebacks, Refunds und weitere Gebühren sind nicht enthalten. Für einen belastbaren Kundeneinsatz reale Angebotsdaten und den Vertragsumfang prüfen.

## Veröffentlichung

Bei GitHub Pages sind die Quelldateien öffentlich zugänglich, auch wenn eine verknüpfte Repository-Einstellung anders wirkt. Keine vertraulichen Tarife oder Kundendaten in den Code schreiben. Die Web-App speichert Eingaben nicht und sendet sie nicht an einen Server.
